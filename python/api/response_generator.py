# response_generator.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from typing import Optional # For optional model choice

from llm.prompt_template import SYSTEM_PROMPT_TEMPLATE # Assuming this still exists for formatting
# Import the new function from chain_config
from llm.chain_config import get_llm_and_prompt
from llm.memory_chain import MyChatChain
from llm.chat_history import YourPostgresChatMessageHistory
from db.query_utils import fetch_prompt_data, add_messages
import time
import traceback # For better error logging

from test import generate_response_logic, ChatRequestForHandler

load_dotenv()

sms_router = APIRouter()

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str
    model_choice: Optional[str] = "claude"

@sms_router.post("/responses")
def generate_response(request: ChatRequest):
    start_time = time.time()
    subscription_code = request.subscriptionCode
    user_input = request.userInput
    model_choice = request.model_choice if request.model_choice else "openai"

    # print(f"Received request for subscription: {subscription_code}, model: {model_choice}")

    try:
        # 1. DB에서 prompt용 정보 조회
        prompt_data = fetch_prompt_data(subscription_code)
        if not prompt_data:
             raise HTTPException(status_code=404, detail=f"Prompt data not found for subscription code: {subscription_code}")
        deceased_code = prompt_data["deceased_code"]

        # 2. system prompt 생성
        try:
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing key for system prompt formatting: {e}")

        # 3. Get the selected LLM and Prompt based on model_choice
        try:
            selected_llm, selected_prompt = get_llm_and_prompt(model_choice)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) # Bad request if model is invalid

        # 4. chain 조립
        base_chain = selected_prompt | selected_llm

        # 5. runnable + memory + invoke
        inputs = {
            "system_prompt": system_prompt,
            "input": user_input
            # "messages" key will be handled by RunnableWithMessageHistory
        }
        config = RunnableConfig(configurable={"session_id": str(subscription_code)}) # Ensure session_id is string if needed by history class

        # Instantiate MyChatChain with the dynamically created base_chain
        chat_chain = MyChatChain(
            base_chain=base_chain, # Pass the dynamic chain
            deceased_code_map={subscription_code: deceased_code}
        )

        # Invoke the chain
        ai_response = chat_chain.invoke(inputs, config=config)

        # Check for valid response content
        if not hasattr(ai_response, 'content') or not ai_response.content:
             raise HTTPException(status_code=500, detail="LLM returned empty or invalid response.")

        response_content = ai_response.content

    except HTTPException as http_exc:
        # Re-raise HTTP exceptions directly
        raise http_exc
    except Exception as e:
        # Log the full error for debugging
        print(f"ERROR generating response: {e}")
        traceback.print_exc() # Print stack trace
        # Return a generic server error
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    end_time = time.time()
    time_taken = end_time - start_time
    print("------------------------------------------")
    print(f"Model Used: {model_choice}")
    print(f"Time Taken (seconds): {time_taken:.2f}")
    print(f"AI Response: {response_content}")
    print("------------------------------------------")


    # 6. Save messages to DB (Consider doing this asynchronously)
    try:
        add_messages(subscription_code, deceased_code,
                     messages=[
                         ("user", user_input),
                         ("ai", response_content)
                     ])
    except Exception as db_e:
        # Log DB error but still return response to user
        print(f"ERROR saving messages to DB: {db_e}")
        traceback.print_exc()

    return {"status": "LLM_RESPONSE", "message": response_content, "model_used": model_choice}


# --- 새로운 엔드포인트 정의 ---
@sms_router.post("/responses/logic") # <--- 새로운 경로 지정
async def handle_generate_response_logic_endpoint(request: ChatRequest):
    """
    분리된 로직 핸들러를 사용하는 새로운 엔드포인트입니다.
    BERT Score 계산 기능 포함 가능.
    """
    print(f"라우터: 새로운 /responses/logic 엔드포인트 호출됨 - 구독 코드: {request.subscriptionCode}")
    try:
        # 핸들러 함수 호출 시, FastAPI가 받은 ChatRequest 객체를
        # 핸들러 함수가 기대하는 타입(ChatRequestForHandler)으로 전달합니다.
        # 두 클래스의 구조가 동일하다면 별도 변환 없이 전달 가능합니다.
        # 만약 구조가 다르다면, 필요한 데이터만 추출하여 전달해야 합니다.
        response_data = generate_response_logic(request) # 핸들러 함수 호출
        print(f"라우터: 핸들러로부터 응답 받음: {response_data.get('status')}")
        return response_data
    except HTTPException as http_exc:
        # 핸들러에서 발생한 HTTPException을 그대로 전달
        print(f"라우터: 핸들러에서 HTTP 예외 발생 - Status: {http_exc.status_code}, Detail: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        # 그 외 예기치 않은 오류 처리
        print(f"라우터: /responses/logic 처리 중 예기치 않은 오류 발생: {e}")
        traceback.print_exc() # 상세 오류 로그 출력
        raise HTTPException(status_code=500, detail="라우터 처리 중 예기치 않은 오류 발생")


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
