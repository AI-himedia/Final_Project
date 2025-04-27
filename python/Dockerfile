ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.8.1-runtime-ubuntu24.04

# 필수 패키지만 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libsndfile1 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# python 심볼릭 링크 생성
RUN ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

# 필요한 경우만 가상 환경 설정
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 의존성 설치
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 && \
    pip cache purge

# 애플리케이션 코드 복사
COPY . /app

EXPOSE 8000

# python3로 명령 실행
CMD python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())" && \
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000