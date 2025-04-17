import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
from huggingface_hub import snapshot_download
from pydub import AudioSegment
from pathlib import Path
import torch
from cli.SparkTTS import SparkTTS
from dotenv import load_dotenv
from urllib.parse import urlparse
import boto3
from io import BytesIO
import numpy as np

load_dotenv()


# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)


MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")


# S3 URL 파싱
def parse_s3_url(s3_url: str):
    parsed = urlparse(s3_url)
    bucket = parsed.netloc.split('.')[0]
    key = parsed.path.lstrip('/')
    return bucket, key

# boto3를 이용한 S3 다운로드
def download_audio_from_s3_to_memory(bucket_name: str, object_key: str) -> BytesIO:
    print(f"S3 오디오 메모리로 다운로드 중... s3://{bucket_name}/{object_key}")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION")
    )
    buffer = BytesIO()
    try:
        s3.download_fileobj(bucket_name, object_key, buffer)
        buffer.seek(0)
        print("메모리 다운로드 완료")
        return buffer
    except Exception as e:
        raise Exception(f"S3 다운로드 실패: {e}")

# 캐시용 전역 변수
spark_model = None
cached_global_token_ids = None

# 모델 및 프롬프트 준비
def ensure_environment_ready():
    if not os.path.exists(MODEL_SAVE_DIR):
        print("Spark-TTS 모델 다운로드 시작")
        snapshot_download(
            repo_id="SparkAudio/Spark-TTS-0.5B",
            local_dir=MODEL_SAVE_DIR,
            repo_type="model"
        )
        print("모델 다운로드 완료")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

# 오디오 변환
def convert_prompt_audio_memory(input_buffer: BytesIO) -> BytesIO:
    audio = AudioSegment.from_file(input_buffer)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)

    output_buffer = BytesIO()
    audio.export(output_buffer, format="wav")
    output_buffer.seek(0)
    print("오디오 변환 완료 (메모리)")
    return output_buffer


def Ready_S3File(s3_url: str) -> BytesIO:
    print("[Ready_S3File] 시작")
    print("S3 주소:", s3_url)

    try:
        bucket, key = parse_s3_url(s3_url)
        original_buffer = download_audio_from_s3_to_memory(bucket, key)
        processed_buffer = convert_prompt_audio_memory(original_buffer)
        return processed_buffer
    except Exception as e:
        print("함수 실행 중 오류 발생:", str(e))
        raise


# PCM to WebM 변환

def pcm_to_webm_chunk(pcm_chunk: np.ndarray, sample_rate=16000):
    audio = AudioSegment(
        pcm_chunk.tobytes(),
        frame_rate=sample_rate,
        sample_width=2,
        channels=1
    )
    buffer = BytesIO()
    audio.export(buffer, format="webm", codec="libopus")
    buffer.seek(0)
    return buffer.read()


# TTS 스트리밍 (WebM binary)
def stream_tts(text: str):
    
    global spark_model, cached_global_token_ids
    
    ensure_environment_ready()

    if spark_model is None:
        print("Spark-TTS 모델 초기화")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)

    if cached_global_token_ids is None:
        print("더미 임베딩 값 사용 중")
        embedding_data = [[[3199,253,1592,4042,290,1733,1056,2665,3594,3475,672,3142,738,3628,3253,3101,1084,3088,3227,1261,541,2425,2271,1461,1602,204,3531,3143,3780,2572,2946,135]]]
        cached_global_token_ids = torch.tensor(embedding_data, dtype=torch.long)

    print("실시간 TTS 생성 중 (raw binary)")
    for audio_chunk in spark_model.stream_inference(text=text, global_token_ids=cached_global_token_ids):
        if isinstance(audio_chunk, np.ndarray):
            yield pcm_to_webm_chunk(audio_chunk)
        elif isinstance(audio_chunk, bytes):
            yield audio_chunk
        else:
            raise TypeError("지원되지 않는 audio_chunk 타입")
