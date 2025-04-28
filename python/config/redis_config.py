import redis
import os
from fastapi import HTTPException

# 배포 전용
try:
    redis_host = os.getenv("REDIS_HOST", "15.165.139.92")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_db = int(os.getenv("REDIS_DB", 0))
    # redis_password = os.getenv("REDIS_PASSWORD")

    redis_client = redis.Redis(host=redis_host, port=redis_port, db=redis_db)
    redis_client.ping()
except redis.ConnectionError:
    raise HTTPException(status_code=500, detail="Redis 서버에 연결할 수 없습니다. Redis가 실행 중인지 확인하세요.")

# 로컬 (암호X)
# try:
#     redis_client = redis.Redis(host='localhost', port=6379, db=0)
#     redis_client.ping()
# except redis.ConnectionError:
#     raise HTTPException(status_code=500, detail="Redis 서버에 연결할 수 없습니다. Redis가 실행 중인지 확인하세요.")

# try:
#     # Redis 클라이언트 연결
#     redis_client = redis.Redis(
#         host='localhost',
#         port=6379,
#         db=0,
#         password=os.getenv("REDIS_PASSWORD"))
#     # redis_client = redis.Redis(host='localhost', port=6379, db=0)
#     redis_client.ping()
# except redis.ConnectionError:
#     raise HTTPException(status_code=500, detail="Redis 서버에 연결할 수 없습니다. Redis가 실행 중인지 확인하세요.")