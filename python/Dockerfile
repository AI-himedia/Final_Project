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

# 가상 환경 생성 및 활성화
RUN python3 -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# pipenv 설치 및 의존성 설치 (가상 환경 내에서)
RUN pip install --no-cache-dir pipenv
RUN pipenv sync --dev

COPY . /app

# torch에서 CUDA 사용 가능한지 체크
RUN python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())"

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
