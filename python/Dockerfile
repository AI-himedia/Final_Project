ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04

RUN apt-get update && apt-get install -y --no-install-recommends \
     python3 \
     python3-pip \
     python3-venv \
     libsndfile1 \
     ffmpeg \
     gcc \
     libpq-dev \
     ffmpeg && \
     apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements.txt 복사
 COPY requirements.txt /app/

 # 가상 환경 생성 및 활성화
RUN python3 -m venv /app/.venv 
ENV PATH="/app/.venv/bin:$PATH"

# requirements.txt로 의존성 설치
 # 패키지 설치
 RUN pip install --no-cache-dir -r requirements.txt

 # torch 관련 패키지 설치
 RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
 
 # 프로젝트 전체 복사
 COPY . /app
 
 # torch에서 CUDA 사용 가능한지 체크
 RUN python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())"

 # 소스코드 복사
 COPY . .

 EXPOSE 8000

 CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]