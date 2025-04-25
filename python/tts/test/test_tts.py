import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
import aiofiles
import aioboto3
from huggingface_hub import snapshot_download
from pathlib import Path
from pydub import AudioSegment
from dotenv import load_dotenv
from urllib.parse import urlparse
from io import BytesIO
import torch
import numpy as np
from scipy.io.wavfile import write
from cli.SparkTTS import SparkTTS
import datetime
import boto3

load_dotenv()

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")

spark_model = None
cached_global_token_ids = None

# 🔧 S3 URL 파싱
def parse_s3_url(s3_url: str):
    parsed = urlparse(s3_url)
    bucket = parsed.netloc.split('.')[0]
    key = parsed.path.lstrip('/')
    return bucket, key

# 🔧 boto3를 이용한 S3 다운로드
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


def initialize_tts_environment():
    global spark_model, cached_global_token_ids
    if spark_model is None:
        print("모델 최초 로딩")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)

    if cached_global_token_ids is None:
        print("Voice cloning 최초 임베딩 생성 중")
        s3_url = 'https://ai-himedia.s3.amazonaws.com/voice/0457bede-dada-497d-b53a-5105db61b7e6_test1.wav'
        buffer = Ready_S3File(s3_url)
        with open("temp_prompt.wav", "wb") as f:
            f.write(buffer.read())
        buffer.seek(0)
        _, cached_global_token_ids = spark_model.process_prompt(
            text="임베딩 생성용 텍스트",
            prompt_speech_path=Path("temp_prompt.wav")
        )
        print("Global token 캐싱 완료")

def now():
    return datetime.datetime.now().strftime('%H:%M:%S')


# TTS 메인 함수
async def run_tts(text: str) -> bytes:
    global spark_model, cached_global_token_ids
    
    if spark_model is None or cached_global_token_ids is None:
        raise RuntimeError("TTS 환경이 초기화되지 않았습니다.")

    print(f"\n[{now()}] TTS 생성 시작")

    wav_np = spark_model.inference(
        text=text,
        global_token_ids=cached_global_token_ids
    )

    print(f"[{now()}]TTS inference 완료")
    wav_int16 = np.int16(wav_np * 32767)

    output_buffer = BytesIO()
    write(output_buffer, 16000, wav_int16)
    output_buffer.seek(0)

    audio_bytes = output_buffer.getvalue() 
    print(f"[{now()}]TTS 생성 완료 (메모리 버퍼 반환)")

    async with aiofiles.open("debug_tts.wav", "wb") as f:
        await f.write(output_buffer.getvalue())
        print(f"[{now()}]debug_tts.wav 저장 완료")

    return audio_bytes
