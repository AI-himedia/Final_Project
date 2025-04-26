from fastapi import APIRouter
from pydantic import BaseModel
from db.postgresql_connector import get_db_connection
from db.query_utils import get_latest_embedding, get_latest_voice_id
from tts.audio_message_tts import cache_embedding_data, cache_voice_id


embedding_router = APIRouter()

class Request(BaseModel):
    subscription_code: int
    service_code: int

@embedding_router.post("/ai/embedding")
def embedding_select(request: Request):

    if request.service_code==2:
        try:
            with get_db_connection() as conn:
                embedding_data = get_latest_embedding(conn, request.subscription_code)
            
            if embedding_data is None:
                return {
                    "status": "error",
                    "message": "해당 구독 코드에 대한 임베딩 정보가 없습니다."
                }
            # 임베딩 데이터를 캐싱하는 함수 호출
            cache_embedding_data(request.subscription_code, embedding_data)

            return {
                "status": "success",
                "message": "임베딩 로딩 및 캐싱 완료"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"조회 중 오류 발생: {str(e)}"
            }
    
    elif request.service_code==3:
        try:
            voice_id = get_latest_voice_id(request.subscription_code)
            
            if voice_id is None:
                return {
                    "status": "error",
                    "message": "해당 구독 코드에 대한 voice_id가 없습니다."
                }
            # 임베딩 데이터를 캐싱하는 함수 호출
            cache_voice_id(request.subscription_code, voice_id)
        

            return {
                "status": "success",
                "message": "voice_id 로딩 및 캐싱 완료"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"조회 중 오류 발생: {str(e)}"
            }