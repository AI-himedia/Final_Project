from fastapi import APIRouter
from pydantic import BaseModel


sms_router = APIRouter()

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str

@sms_router.post("/generate-response")
def generate_response(request: ChatRequest):
    # TODO: DB에서 subscriptionCode로 정보 조회
    # TODO: prompt 생성, recent context 조회 → ChatGPT 호출
    return {"response": f"({request.subscriptionCode})로부터 받은 메시지: {request.userInput}"}
