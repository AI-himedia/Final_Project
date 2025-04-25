# Python 버전 지정 (빌드 아규먼트)
ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu${PYTHON_VERSION}-slim

# 작업 디렉토리 설정
WORKDIR /app

# Pipenv 설치
RUN pip install --no-cache-dir pipenv

# Pipfile 및 Pipfile.lock 복사
COPY Pipfile Pipfile.lock ./

# 가상 환경 생성 및 패키지 설치
RUN pipenv sync --dev

# FastAPI 앱 복사
COPY . .

# 포트 8000으로 설정
EXPOSE 8000

# 애플리케이션 실행
CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]