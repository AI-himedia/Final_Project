# Python 3.12
FROM python:3.12-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 패키지 설치
COPY requirements.txt .
RUN pip install -r requirements.txt

# FastAPI 앱 복사
COPY . .

# 포트 8000으로 설정
EXPOSE 8000

# 애플리케이션 실행 (Flask 예시)
CMD ["uvicorn", "test:app", "--host", "0.0.0.0", "--port", "8000"]