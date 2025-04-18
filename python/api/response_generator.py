from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from llm.chat.prompt_template import SYSTEM_PROMPT_TEMPLATE 
from llm.chat.chain_config import get_llm_and_prompt
from llm.chat.memory_chain import MyChatChain
from db.query_utils import fetch_prompt_data
from config.redis_config import redis_client
import time
import traceback # 에러 로깅
import logging
from typing import Optional 


load_dotenv()
sms_router = APIRouter()

model_choices = ["openai", "claude", "sonar"]

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str

@sms_router.post("/ai/responses")
def generate_response(request: ChatRequest):
    start_time = time.time()
    subscription_code = request.subscriptionCode
    user_input = request.userInput
    chosen_model: str

    try:
        # 1. DB에서 prompt용 정보 조회
        prompt_data = fetch_prompt_data(subscription_code)
        if not prompt_data:
             raise HTTPException(status_code=404, detail=f"Prompt data not found for subscription code: {subscription_code}")
        # 조회해온 고인코드 일단 저장
        deceased_code = prompt_data["deceased_code"]

        # 2. system prompt 생성
        try:
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)
            print("------------------------------------------")
            print('system_prompt:', system_prompt)
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing key for system prompt formatting: {e}")

        # 3. 모델을 순차적으로 시도 (openai -> claude -> sonar)
        ai_response = None
        for model in model_choices:
            try:
                # 4. LLM 모델과 그에 맞는 프롬프트 템플릿
                selected_llm, model_name_version, selected_prompt = get_llm_and_prompt(model)
            
                # 5. chain 조립
                base_chain = selected_prompt | selected_llm

                # 6. runnable + memory + invoke
                inputs = {
                    "system_prompt": system_prompt,
                    "input": user_input
                }

                config = RunnableConfig(configurable={"session_id": str(subscription_code)}) 
                  
                # 동적으로 생성된 base_chain을 사용하여 MyChatChain 인스턴스화
                # redis_config.py에서 생성한 redis_client는 전역 인스턴스
                chat_chain = MyChatChain(
                    base_chain=base_chain, # 동적으로 생성된 chain 전달
                    deceased_code_map={subscription_code: deceased_code},
                    redis_client=redis_client # 생성한 redis_client 전달
                )

                # 체인 실행
                ai_response = chat_chain.invoke(inputs, config=config)

                # 유효한 응답 내용 체크
                if ai_response is None or not hasattr(ai_response, 'content') or not ai_response.content:
                    raise ValueError(f"Model {model} returned empty or invalid response.")
                
                # 유효한 응답이 있다면 종료
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


    # 6. 응답 저장 (Redis + DB) (DB INSERT는 비동기 처리 고려)
    try:
        chat_chain.chat_history_instance.store_message(subscription_code, deceased_code, user_input, ai_response)

    except Exception as db_e:
        # DB 오류는 로깅만 하고 사용자에게는 응답을 계속 반환
        print(f"ERROR saving messages to DB: {db_e}")
        traceback.print_exc()

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
