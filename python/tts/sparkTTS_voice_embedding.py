import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
from huggingface_hub import snapshot_download
from pydub import AudioSegment
from pathlib import Path
import torch
from tts.cli.SparkTTS import SparkTTS
from scipy.io.wavfile import write
from dotenv import load_dotenv
from urllib.parse import urlparse
import boto3
from io import BytesIO
import numpy as np
from pydub import AudioSegment
import datetime
import uuid
from tempfile import NamedTemporaryFile
import aiofiles
import aioboto3
from model.tts_model_loader import ensure_model_loaded, get_loaded_model

load_dotenv()


# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)


MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")


# 캐시용 전역 변수
# spark_model = None
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

# #모델 준비
# def ensure_model_loaded():
#     global spark_model
#     ensure_environment_ready()  # 모델 파일이 없다면 다운로드

#     if spark_model is None:
#         print("모델 메모리 로딩 시작")
#         device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)
#         print("모델 로딩 완료")
#         return spark_model
    
# def get_loaded_model():
#     global spark_model
#     return spark_model

# # 모델 다운로드
# def ensure_environment_ready():
#     if not os.path.exists(MODEL_SAVE_DIR) or not os.path.exists(os.path.join(MODEL_SAVE_DIR, "config.json")):
#         print("Spark-TTS 모델 다운로드 시작")
#         snapshot_download(
#             repo_id="SparkAudio/Spark-TTS-0.5B",
#             local_dir=MODEL_SAVE_DIR,
#             repo_type="model"
#         )
#         print("모델 다운로드 완료")
#     else:
#         print(":흰색_확인_표시: 이미 모델이 존재합니다. 다운로드 생략.")
#     os.makedirs(OUTPUT_DIR, exist_ok=True)

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
        # ensure_environment_ready()
        bucket, key = parse_s3_url(s3_url)
        original_buffer = download_audio_from_s3_to_memory(bucket, key)
        processed_buffer = convert_prompt_audio_memory(original_buffer)
        embedding_result = embedding(processed_buffer)
        return embedding_result
    except Exception as e:
        print("함수 실행 중 오류 발생:", str(e))
        raise

def get_buffer_from_S3(s3_url: str) -> BytesIO:
    print("[Ready_S3File] 시작")
    print("S3 주소:", s3_url)
    try:
        # ensure_environment_ready()
        bucket, key = parse_s3_url(s3_url)
        buffer = download_audio_from_s3_to_memory(bucket, key)
        return buffer
    except Exception as e:
        print("함수 실행 중 오류 발생:", str(e))
        raise


# def Ready_S3File(s3_url: str) -> BytesIO:
#     print("[Ready_S3File] 시작")
#     print("S3 주소:", s3_url)
#     try:
#         ensure_model_loaded()
#         bucket, key = parse_s3_url(s3_url)
#         original_buffer = download_audio_from_s3_to_memory(bucket, key)
#         processed_buffer = convert_prompt_audio_memory(original_buffer)
#         return processed_buffer  # 변경: 임베딩 대신 변환된 오디오 버퍼 반환
#     except Exception as e:
#         print("함수 실행 중 오류 발생:", str(e))
#         raise

def embedding(processed_audio: BytesIO) -> list:
    ensure_model_loaded()
    spark_model = get_loaded_model()
    print("임베딩 생성 중...")

    

    # 2. 항상 새로 임베딩 생성
    with NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
        tmp_filename = tmp_file.name
        tmp_file.write(processed_audio.read())

    try:
        _, global_token_ids = spark_model.process_prompt(
            text="임베딩 생성용 텍스트",
            prompt_speech_path=Path(tmp_filename)
        )
        print("임베딩 생성 완료")
        print("원본 임베딩 값:", global_token_ids.tolist())
        return global_token_ids.tolist()
    finally:
        Path(tmp_filename).unlink(missing_ok=True)

# 임베딩 값 캐시화
def cache_embedding_data(embedding_data: list):
    global cached_global_token_ids
    if cached_global_token_ids is None:
        cached_global_token_ids = torch.tensor(embedding_data)
        print("임베딩 캐싱 완료")

def now():
    return datetime.datetime.now().strftime('%H:%M:%S')

# # TTS 메인 함수
# async def run_tts(text: str) -> bytes:
#     global spark_model, cached_global_token_ids
    
#     if spark_model is None or cached_global_token_ids is None:
#         raise RuntimeError("TTS 환경이 초기화되지 않았습니다.")

#     print(f"\n[{now()}] TTS 생성 시작")

#     wav_np = spark_model.inference(
#         text=text,
#         global_token_ids=cached_global_token_ids
#     )

#     print(f"[{now()}]TTS inference 완료")
#     wav_int16 = np.int16(wav_np * 32767)

#     output_buffer = BytesIO()
#     write(output_buffer, 16000, wav_int16)
#     output_buffer.seek(0)

#     audio_bytes = output_buffer.getvalue() 
#     print(f"[{now()}]TTS 생성 완료 (메모리 버퍼 반환)")

#     async with aiofiles.open("debug_tts.wav", "wb") as f:
#         await f.write(output_buffer.getvalue())
#         print(f"[{now()}]debug_tts.wav 저장 완료")

#     return audio_bytes
