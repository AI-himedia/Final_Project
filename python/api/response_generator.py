from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import AIMessage, HumanMessage
from llm.chat.prompt_template import SYSTEM_PROMPT_TEMPLATE, SYSTEM_PROMPT_TEMPLATE_FOR_CALL
from llm.chat.chain_config import get_llm_and_prompt
from llm.chat.memory_chain import MyChatChain
from model.embedding_model import embedding_model
from llm.models.request_models import ChatRequest
from db.query_utils import fetch_prompt_data, get_similar_messages_with_embedding, get_vector
from config.redis_config import redis_client
import time
import traceback # 에러 로깅
import logging
from typing import Optional 
import numpy as np


load_dotenv()
sms_router = APIRouter()

model_choices = ["openai", "claude", "sonar"]



@sms_router.post("/ai/responses")
def generate_response(request: ChatRequest):
    start_time = time.time()
    subscription_code = request.subscriptionCode
    user_input = request.userInput
    service_type = request.serviceType
    chosen_model: str

    try:
        # 1. DB에서 prompt용 정보 조회
        prompt_data = fetch_prompt_data(subscription_code)
        if not prompt_data:
             raise HTTPException(status_code=404, detail=f"Prompt data not found for subscription code: {subscription_code}")
        # 조회해온 고인코드 일단 저장
        deceased_code = prompt_data["deceased_code"]

        # 2. user_input 임베딩 
        # tolist()로 바꿔주는 이유는 DB에 넣거나 쿼리문에 넘기기 위해서
        query_text = f"query: {user_input}"
        user_embedding = embedding_model.encode(query_text, normalize_embeddings=True).tolist()
        print("L2 norm:", np.linalg.norm(user_embedding))

        # 2. 유사도 높은 과거 대화 검색
        similar_messages = get_similar_messages_with_embedding(deceased_code, user_embedding, top_k=5)

        # retrieved_messages 리스트 생성
        retrieved_messages = []
        for msg in similar_messages:
            print(f"{msg['role'].upper()} | {msg['similarity']:.4f} | {msg['content']}")
            if msg['role'] == 'user':
                retrieved_messages.append(HumanMessage(content=msg['content']))
            else:
                retrieved_messages.append(AIMessage(content=msg['content']))

        # 3. system prompt 생성
        if(service_type == 'sms'):
            try:
                system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)
                print("------------------------------------------")
                print('system_prompt:', system_prompt)
            except KeyError as e:
                raise HTTPException(status_code=500, detail=f"Missing key for system prompt formatting: {e}")
        elif(service_type == 'call'):
            try:
                system_prompt = SYSTEM_PROMPT_TEMPLATE_FOR_CALL.format(**prompt_data)
                print("------------------------------------------")
                print('system_prompt:', system_prompt)
            except KeyError as e:
                raise HTTPException(status_code=500, detail=f"Missing key for system prompt formatting: {e}")
        

        # 4. 모델을 순차적으로 시도 (openai -> claude -> sonar)
        print(f"[DEBUG] similar_messages: {similar_messages}")
        print(f"[DEBUG] retrieved_messages: {retrieved_messages}")
        ai_response = None
        for model in model_choices:
            try:
                # 5. LLM 모델과 그에 맞는 프롬프트 템플릿
                selected_llm, model_name_version, selected_prompt = get_llm_and_prompt(model)
            
                # 6. chain 조립
                base_chain = selected_prompt | selected_llm

                # 7. runnable + memory + invoke
                inputs = {
                    "system_prompt": system_prompt,
                    "input": user_input,
                    "retrieved": retrieved_messages
                }

                config = RunnableConfig(configurable={"session_id": str(subscription_code)}) 
                  
                # 8. 동적으로 생성된 base_chain을 사용하여 MyChatChain 인스턴스화
                # redis_config.py에서 생성한 redis_client는 전역 인스턴스
                chat_chain = MyChatChain(
                    base_chain=base_chain, # 동적으로 생성된 chain 전달
                    deceased_code_map={subscription_code: deceased_code},
                    redis_client=redis_client # 생성한 redis_client 전달
                )

                # 9. 체인 실행
                ai_response = chat_chain.invoke(inputs, config=config)

                # 10. 유효한 응답 내용 체크
                if ai_response is None or not hasattr(ai_response, 'content') or not ai_response.content:
                    raise ValueError(f"Model {model} returned empty or invalid response.")
                
                # 11. 유효한 응답이 있다면 종료
                chosen_model = model_name_version
                break  # 성공적으로 응답을 받았으므로 루프 종료

            except (ValueError, Exception) as e:
                # 각 모델에서 오류가 나면 계속해서 다음 모델로 재시도
                print(f"Error with model {model}: {e}")
                continue

        # 모든 모델이 실패한 경우
        if ai_response is None or not hasattr(ai_response, 'content') or not ai_response.content:
            raise HTTPException(status_code=500, detail="All models failed to generate a valid response.")

        ai_response = ai_response.content

    except HTTPException as http_exc:
        # HTTP 예외는 직접 다시 발생시킴
        raise http_exc
    except Exception as e:
        # 전체 에러를 로깅
        print(f"ERROR generating response: {e}")
        logging.error(f"ERROR generating response: {e}", exc_info=True)
        # 일반적인 서버 에러 반환
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    end_time = time.time()
    time_taken = end_time - start_time
    print("------------------------------------------")
    print(f"Model Used: {chosen_model}")
    print(f"Time Taken (seconds): {time_taken:.2f}")
    print(f"AI Response: {ai_response}")
    print("------------------------------------------")


    # 12. ai_response 임베딩
    passage_text = f"passage: {ai_response}"
    ai_embedding  = embedding_model.encode(passage_text, normalize_embeddings=True).tolist()

    # 13. 응답 저장 (Redis + DB) (DB INSERT는 비동기 처리 고려)
    try:
        chat_chain.chat_history_instance.store_message(
            subscription_code, 
            deceased_code,
            service_type, 
            user_input, 
            ai_response,
            user_embedding=user_embedding,          
            ai_embedding=ai_embedding,              
            model_version="intfloat/multilingual-e5-base"  
        )


    

    except Exception as db_e:
        # DB 오류는 로깅만 하고 사용자에게는 응답을 계속 반환
        print(f"ERROR saving messages to DB: {db_e}")
        traceback.print_exc()



    content, vector = get_vector()

    print(type(vector))  # list인지 str인지 확인
    print(content)
    if isinstance(vector, (list, np.ndarray)):
        print("✅ DB에 float[]로 저장되어 있습니다.")
        print("벡터 길이:", len(vector))
        print("L2 Norm:", np.linalg.norm(np.array(vector)))
    else:
        print("❌ DB에 문자열로 저장되어 있음. pgvector 유사도 계산 불가.")
 
    # v = np.array(vector)
    # print("------------------------------")
    # print(np.linalg.norm(v))


    return {"status": "LLM_RESPONSE", "message": ai_response, "model_used": model}



# from fastapi import APIRouter
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from langchain_core.runnables import RunnableConfig
# from llm.prompt_template import SYSTEM_PROMPT_TEMPLATE
# from llm.chain_config import base_chain
# from llm.memory_chain import MyChatChain
# from llm.chat_history import YourPostgresChatMessageHistory
# from db.query_utils import fetch_prompt_data, add_messages
# import time

# load_dotenv()
# sms_router = APIRouter()

# class ChatRequest(BaseModel):
#     subscriptionCode: int
#     userInput: str


# @sms_router.post("/responses")
# def generate_response(request: ChatRequest):
    
#     start_time = time.time()

#     subscription_code = request.subscriptionCode
#     user_input = request.userInput

#     # 1. DB에서 prompt용 정보 조회
#     prompt_data = fetch_prompt_data(subscription_code)
#     deceased_code = prompt_data["deceased_code"]

#     # 2. system prompt 생성
#     system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)

#     # 3. runnable + memory + invoke
#     inputs = {
#         "system_prompt": system_prompt,
#         "input": user_input
#     }

#     config = RunnableConfig(configurable={"session_id": subscription_code})

#     chat_chain = MyChatChain(
#         base_chain,
#         deceased_code_map={subscription_code: deceased_code}
#     )

#     try:
#         ai_response = chat_chain.invoke(inputs, config=config)
#     except Exception as e:
#         # 실패 시 저장 없이 종료
#         return {"status": "ERROR", "message": str(e)}
    
#     end_time = time.time()
#     # Calculate the time taken
#     time_taken = end_time - start_time
#     print("------------------------------------------")
#     print('Time Taken (seconds):', time_taken)
    
#     add_messages(subscription_code, deceased_code, 
#                  messages=[
#         ("user", user_input),
#         ("ai", ai_response.content)
#     ])

#     return {"status": "LLM_RESPONSE", "message": ai_response.content}