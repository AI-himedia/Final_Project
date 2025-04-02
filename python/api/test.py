from fastapi import APIRouter

test_router = APIRouter()

@test_router.get("/ai/test")
def test_api():
    return {
        "status": "success",
        "message": "테스트 API 응답입니다!",
        "data": {"id": 1, "name": "테스트 데이터"}
    }