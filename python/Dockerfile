ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04

# 기본적으로 필요한 패키지 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libsndfile1 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 인증 파일 저장 디렉토리 생성
RUN mkdir -p /app/gcp_credentials

# GOOGLE_APPLICATION_CREDENTIALS 환경 변수를 EC2 경로로 설정 (파일 경로는 EC2에서 전달받습니다)
ENV GOOGLE_APPLICATION_CREDENTIALS="/home/ubuntu/hello-again-ai-project.json"

# Pipfile과 관련된 의존성 설치
COPY Pipfile Pipfile.lock /app/

# Python 가상 환경 설정
RUN python3 -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# 필요한 패키지들 설치
RUN pip install --no-cache-dir pipenv

RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# pipenv로 필요한 의존성 설치
RUN pipenv sync --dev

COPY . /app

RUN python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())"

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
