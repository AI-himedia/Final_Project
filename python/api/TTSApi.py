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
    try:
        processed_audio = Ready_S3File(request.s3_url)
        return {
            "status": "success",
            "message": "오디오 변환 완료",
            "audio_length": len(processed_audio.getvalue())  # 선택 사항: 변환된 파일의 바이트 길이
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"변환 중 오류 발생: {str(e)}"
        }

if __name__ == "__main__":
    uvicorn.run("TTSApi:app", host="0.0.0.0", port=8000)