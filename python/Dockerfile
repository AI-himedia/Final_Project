# Python 버전 지정 (빌드 아규먼트)
ARG PYTHON_VERSION=3.11

# 올바른 nvidia/cuda 이미지 태그 사용
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

# 작업 디렉토리 설정
WORKDIR /app

# 시스템에 Python 3.11 설치
RUN apt-get update && \
    apt-get install -y python${PYTHON_VERSION} python${PYTHON_VERSION}-dev python${PYTHON_VERSION}-distutils && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python${PYTHON_VERSION}

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
