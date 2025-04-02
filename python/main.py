from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import routers
import uvicorn


app = FastAPI()

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
# app.include_router(test.router)
# 나중에 user, memory 등도 추가 가능
# app.include_router(user.router)
# app.include_router(memory.router)

@app.get("/")
def root():
    return {"message": "FastAPI 메인 라우터"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)