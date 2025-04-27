ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04

# 필요한 패키지 업데이트 및 Python 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libsndfile1 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Pipfile Pipfile.lock /app/

# pipenv 전역 설치 (시스템 Python에)
RUN pip3 install --no-cache-dir pipenv

# 가상 환경 생성 및 의존성 설치
RUN pipenv install --dev

# torch 관련 패키지 설치 (pipenv 환경 내부에)
RUN pipenv run pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

COPY . /app

# torch에서 CUDA 사용 가능한지 체크
RUN pipenv run python -c "import torch; print('CUDA available:', torch.cuda.is_available())"

EXPOSE 8000

# 새로운 시작 스크립트 생성
RUN echo '#!/bin/bash\npipenv run uvicorn main:app --host 0.0.0.0 --port 8000' > /app/start.sh && \
    chmod +x /app/start.sh

# 스크립트 실행
CMD ["/app/start.sh"]