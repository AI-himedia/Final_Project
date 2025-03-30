from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
# CORS 설정 (프론트엔드에서 API 호출 가능하도록 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (배포 시 특정 도메인으로 변경)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "FastAPI 백엔드가 정상적으로 실행 중입니다!"}
@app.get("/ai/test")
def test_api():
    return {
        "status": "success",
        "message": "테스트 API 응답입니다!",
        "data": {"id": 1, "name": "테스트 데이터"}
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
