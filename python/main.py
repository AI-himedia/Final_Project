import asyncio
import sys
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from model.embedding_model import embedding_model  # 전역 임베딩 모델 로딩용 import
from dotenv import load_dotenv
from api import routers
import uvicorn
from api.call_fastAPI import call_router as call_router
from api.audio_chat_fastAPI import audio_chat_router as audio_chat_router
from model.tts_model_loader import ensure_model_loaded  # TTS 모델 로딩

# Windows에서는 asyncio 서브프로세스 지원을 위해 꼭 필요함
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


app = FastAPI()



# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# .env 로드
load_dotenv()


# 라우터 등록
for router in routers:
    app.include_router(router)
# app.include_router(test.router)
# 나중에 user, memory 등도 추가 가능
# app.include_router(user.router)
# app.include_router(memory.router)
    # app.include_router(ws_router)
    app.include_router(call_router)
    app.include_router(audio_chat_router)

@app.get("/")
def root():
    return {"message": "FastAPI 메인 라우터"}

if __name__ == "__main__":
    ensure_model_loaded()
    uvicorn.run(app, host="0.0.0.0", port=8000)