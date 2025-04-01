from fastapi import APIRouter

router = APIRouter()

@router.get("/ai/test")
def test_api():
    return {
        "status": "success",
        "message": "테스트 API 응답입니다!",
        "data": {"id": 1, "name": "테스트 데이터"}
    }