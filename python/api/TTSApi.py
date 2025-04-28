from fastapi import APIRouter
from pydantic import BaseModel
import uvicorn

from tts.sparkTTS_voice_embedding import Ready_S3File, get_buffer_from_S3

# from tts.tts_test import Ready_S3File, get_buffer_from_S3

from db.postgresql_connector import get_db_connection
from db.query_utils import voice_raw_file, insert_raw_file_and_voice_id
import os
from dotenv import load_dotenv
import requests

TTSReady_router = APIRouter()

class S3Request(BaseModel):
    s3_url: str
    subscription_code: int
    service_code: int

@TTSReady_router.post("/ai/synthesize")
def synthesize(request: S3Request):
    print(f"서비스코드 : {request.service_code}")

    if request.service_code == 2:
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
        
    elif request.service_code == 3:
        load_dotenv()
        API_KEY = os.getenv("ELEVENLABS_API_KEY")

        # S3에서 파일 가져오기
        buffer = get_buffer_from_S3(request.s3_url)

        # 1. 업로드할 화자 정보
        VOICE_NAME = f"{request.subscription_code}"  # 원하는 이름으로 설정
        FILE_PATH = "./voice_sample/sample1.mp3"  # 경로 확인 필수

        # 2. API 요청 설정
        url = "https://api.elevenlabs.io/v1/voices/add"
        headers = {
            "xi-api-key": API_KEY
        }

        files = {
            "name": (None, VOICE_NAME),
            "files": (request.s3_url, buffer, "audio/wav")
        }

        # 3. 요청 보내기
        response = requests.post(url, headers=headers, files=files)

        # 4. 결과 확인
        if response.status_code == 200:
            result = response.json()
            voice_id = result["voice_id"]
            print("클로닝 완료!")
            print("voice_id:", voice_id)
            
            insert_raw_file_and_voice_id(
                subscription_code=request.subscription_code,
                s3_url=request.s3_url,
                voice_id=voice_id
            )

            return {
                "status": "success",
                "message": "사용자 정보 저장 완료",
            }


        else:
            print("오류 발생:", response.status_code, response.text)


if __name__ == "__main__":
    uvicorn.run("TTSApi:app", host="0.0.0.0", port=8000)