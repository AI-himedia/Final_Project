ARG PYTHON_VERSION=3.11
FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04

# Python 및 pip 설치
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip

WORKDIR /app

COPY Pipfile Pipfile.lock /app/

# pipenv 설치 및 의존성 설치
RUN pip install --no-cache-dir pipenv && \
    pipenv sync --dev

COPY . /app

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]