# 베이스 이미지
FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04

# 시스템 패키지 업데이트 및 필요한 라이브러리 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사
COPY requirements.txt .

# 패키지 설치
RUN pip3 install --no-cache-dir -r requirements.txt
# torch 미리 설치
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 소스코드 복사
COPY . .

# torch에서 CUDA 사용 가능한지 체크
RUN python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())"

# 포트 오픈 (필요에 따라 수정)
EXPOSE 8000

# 컨테이너 시작 명령어 (FastAPI 예시)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]