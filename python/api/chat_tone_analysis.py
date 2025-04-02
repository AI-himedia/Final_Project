from fastapi import APIRouter, Request
from pydantic import BaseModel

sms_router = APIRouter()

# 요청 데이터 구조 정의
class ChatRequest(BaseModel):
    chatData: str

@sms_router.post("/chat-tone-analysis")
async def analyze_chat(data: ChatRequest):
    text = data.chatData
    print(text)
    return {"success"}