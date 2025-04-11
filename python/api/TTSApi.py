from fastapi import APIRouter
from pydantic import BaseModel
import uvicorn
from tts.tts_test import Ready_S3File
import sys
import os

TTSReady_router = APIRouter()

class S3Request(BaseModel):
    s3_url: str

@TTSReady_router.post("/be/synthesize")
def synthesize(request: S3Request):
    print("✅ 받은 요청:", request)
    try:
        Ready_S3File(request.s3_url)
        return {"status": "success", "message": "TTS done"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("TTSApi:app", host="0.0.0.0", port=8000)