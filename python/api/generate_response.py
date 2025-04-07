from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.runnables import RunnableConfig
from llm.prompt_template import SYSTEM_PROMPT_TEMPLATE
from llm.chain_config import base_chain
from llm.memory_chain import MyChatChain
from llm.prompt_data import fetch_prompt_data


sms_router = APIRouter()

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str

# @sms_router.post("/generate-response")
# def generate_response(request: ChatRequest):
#     # TODO: DB에서 subscriptionCode로 정보 조회
#     # TODO: prompt 생성, recent context 조회 → ChatGPT 호출
#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute("SELECT '✅ FastAPI + .env + PostgreSQL 연결 성공!'")
#     result = cur.fetchone()
#     cur.close()
#     conn.close()



#     return {"response": f"({request.subscriptionCode})로부터 받은 메시지: {request.userInput}"}



@sms_router.post("/generate-response")
def generate_response(request: ChatRequest):
    subscription_code = request.subscriptionCode
    user_input = request.userInput

    # 1. DB에서 prompt용 정보 조회
    prompt_data = fetch_prompt_data(subscription_code)

    # 2. system prompt 생성
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)

    # 3. runnable + memory + invoke
    inputs = {
        "system_prompt": system_prompt,
        "input": user_input
    }
    config = RunnableConfig(configurable={"session_id": subscription_code})

    my_chat_chain = MyChatChain(base_chain)
    response = my_chat_chain.invoke(inputs, config=config)
    
    return {"response": response.content}
