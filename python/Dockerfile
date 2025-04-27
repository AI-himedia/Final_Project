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

# 가상 환경 생성
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Pipfile.lock 대신 requirements.txt 사용 (아래 명령으로 생성 가능)
# pipenv requirements > requirements.txt
COPY requirements.txt /app/

# pip으로 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# torch 관련 패키지 설치
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

COPY . /app

# torch에서 CUDA 사용 가능한지 체크
RUN python -c "import torch; print('CUDA available:', torch.cuda.is_available())"

EXPOSE 8000

# 직접 실행
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]