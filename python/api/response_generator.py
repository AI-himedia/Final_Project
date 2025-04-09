from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from llm.prompt_template import SYSTEM_PROMPT_TEMPLATE
from llm.chain_config import base_chain
from llm.memory_chain import MyChatChain
from llm.chat_history import YourPostgresChatMessageHistory
from db.query_utils import fetch_prompt_data, add_messages

load_dotenv()
sms_router = APIRouter()

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str


@sms_router.post("/responses")
def generate_response(request: ChatRequest):
    subscription_code = request.subscriptionCode
    user_input = request.userInput

    # 1. DB에서 prompt용 정보 조회
    prompt_data = fetch_prompt_data(subscription_code)
    deceased_code = prompt_data["deceased_code"]

    # 2. system prompt 생성
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)


    # 3. runnable + memory + invoke
    inputs = {
        "system_prompt": system_prompt,
        "input": user_input
    }

    config = RunnableConfig(configurable={"session_id": subscription_code})

    chat_chain = MyChatChain(
        base_chain,
        deceased_code_map={subscription_code: deceased_code}
    )

    try:
        ai_response = chat_chain.invoke(inputs, config=config)
    except Exception as e:
        # 실패 시 저장 없이 종료
        return {"status": "ERROR", "message": str(e)}
    
    add_messages(subscription_code, deceased_code, 
                 messages=[
        ("user", user_input),
        ("ai", ai_response.content)
    ])

    return {"status": "LLM_RESPONSE", "message": ai_response.content}
