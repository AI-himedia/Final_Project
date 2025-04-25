# Python 버전 지정 (빌드 아규먼트)
ARG PYTHON_VERSION=3.11

# CUDA와 cuDNN, Ubuntu 24.04 이미지 사용
FROM nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04

# 작업 디렉토리 설정
WORKDIR /app

# Python 3.11 및 pip 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-dev \
    python3.11-distutils \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11 \
    && rm -rf /var/lib/apt/lists/*

# Pipenv 설치
RUN pip install --no-cache-dir pipenv

# Pipfile 및 Pipfile.lock 복사
COPY Pipfile Pipfile.lock ./

# 가상 환경 생성 및 패키지 설치
RUN pipenv sync --system --dev

# FastAPI 앱 복사
COPY . .

# 포트 8000으로 설정
EXPOSE 8000

# 애플리케이션 실행
CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
