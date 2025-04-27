import asyncio
import sys
import os  # os 모듈 추가
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from model.embedding_model import embedding_model
from dotenv import load_dotenv
from api import routers
import uvicorn
from api.call_fastAPI import call_router as call_router
from api.audio_chat_fastAPI import audio_chat_router as audio_chat_router
from model.tts_model_loader import ensure_model_loaded

# Windows에서는 asyncio 서브프로세스 지원을 위해 꼭 필요함
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


app = FastAPI()

# .env 로드 (중복 호출 제거)
# load_dotenv()

# @app.on_event("startup")
# async def startup_event():
#     # 환경 변수 로드
#     google_credentials = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "환경 변수가 없습니다.")
#     openai_key = os.getenv("OPENAI_API_KEY", "환경 변수가 없습니다.")
    
#     # 환경 변수 출력
#     print(f"GOOGLE_APPLICATION_CREDENTIALS: {google_credentials}")
#     print(f"OPENAI_API_KEY: {openai_key}")


# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
for router in routers:
    app.include_router(router)
    
# 추가된 라우터들
app.include_router(call_router)
app.include_router(audio_chat_router)

@app.get("/")
def root():
    return {"message": "FastAPI 메인 라우터"}

if __name__ == "__main__":
    ensure_model_loaded()
    uvicorn.run(app, host="0.0.0.0", port=8000)
