from fastapi import APIRouter
from pydantic import BaseModel
import uvicorn
from tts.tts_test import Ready_S3File
from db.postgresql_connector import get_db_connection
from db.query_utils import voice_raw_file

TTSReady_router = APIRouter()

class S3Request(BaseModel):
    s3_url: str
    subscription_code: int

@TTSReady_router.post("/ai/synthesize")
def synthesize(request: S3Request):
    try:
        # 1. 임베딩 생성
        embedding = Ready_S3File(request.s3_url)

        # 2. DB 저장
        with get_db_connection() as conn:
            code = voice_raw_file(
                conn,
                subscription_code=request.subscription_code,
                s3_url=request.s3_url,
                embedding_data=embedding
            )

        return {
            "status": "success",
            "message": "사용자 정보 저장 완료",
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"변환 중 오류 발생: {str(e)}"
        }

if __name__ == "__main__":
    uvicorn.run("TTSApi:app", host="0.0.0.0", port=8000)