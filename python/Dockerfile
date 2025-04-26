ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libsndfile1 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Pipfile Pipfile.lock /app/

RUN python3 -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

RUN pip install --no-cache-dir pipenv

RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

RUN pipenv sync --dev

COPY . /app

RUN python3 -c "import torch; print('CUDA available:', torch.cuda.is_available())"

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
