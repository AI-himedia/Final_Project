import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
from huggingface_hub import snapshot_download
from pydub import AudioSegment
from pathlib import Path
import torch
from tts.cli.SparkTTS import SparkTTS
from dotenv import load_dotenv
from urllib.parse import urlparse
import boto3
from io import BytesIO
import numpy as np
from scipy.signal import resample
import subprocess
from datetime import datetime
from scipy.io.wavfile import write
from scipy.signal import resample
import time

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

def resample_audio(audio_array: np.ndarray, orig_sr=16000, target_sr=48000):
    target_len = int(len(audio_array) * target_sr / orig_sr)
    return resample(audio_array, target_len)


def save_debug_audio(audio_array: np.ndarray, sample_rate: int = 16000) -> str:
    # 현재 시간 기반 파일명 생성
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"debug_tts_{timestamp}.wav"
    output_dir = Path.cwd() / "results"
    output_dir.mkdir(parents=True, exist_ok=True)
    filepath = output_dir / filename

    # float → int16로 변환 (Spark-TTS 출력이 보통 float이므로)
    audio_int16 = np.int16(audio_array * 32767)
    write(filepath, sample_rate, audio_int16)

    return str(filepath)

# PCM to WebM 변환
# def pcm_to_webm_chunk(pcm_chunk: np.ndarray, sample_rate=16000):
#     audio = AudioSegment(
#         pcm_chunk.tobytes(),
#         frame_rate=sample_rate,
#         sample_width=2,
#         channels=1
#     )
#     buffer = BytesIO()
#     audio.export(buffer, format="webm", codec="libopus")
#     buffer.seek(0)
#     return buffer.read()



def pcm_to_webm_chunk(audio_array: np.ndarray, sample_rate: int):
    audio_array = np.clip(audio_array, -1.0, 1.0)
    audio_array_int16 = (audio_array * 32767).astype(np.int16)

    process = subprocess.Popen(
        [
            'ffmpeg',
            '-f', 's16le',
            '-ar', str(sample_rate),
            '-ac', '1',
            '-i', 'pipe:0',
            '-f', 'webm',
            '-c:a', 'libopus',
            '-application', 'audio',
            '-vbr', 'off',
            '-compression_level', '0',
            '-b:a', '64k',
            '-loglevel', 'quiet',
            'pipe:1'
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE
    )

    webm_data, _ = process.communicate(audio_array_int16.tobytes())
    return webm_data

# 쿠다 확인용
print(torch.cuda.is_available())  # True
print(torch.cuda.get_device_name(0))
print(torch.version.cuda)


# TTS 스트리밍 (WebM binary)
def stream_tts(text: str):
    
    global spark_model, cached_global_token_ids
    
    ensure_environment_ready()

    if spark_model is None:
        print("[TTS]Spark-TTS 모델 초기화")
        t0 = time.perf_counter()

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)

        t1 = time.perf_counter()
        print(f"[TTS] 모델 초기화 완료 (소요 시간: {t1 - t0:.2f}초)")


    if cached_global_token_ids is None:
        print("[TTS]더미 임베딩 값 사용 중")
        embedding_data =[[[2219, 2049, 2047, 4048, 2438, 267, 2197, 3581, 911, 3338, 3937, 174, 694, 3616, 2284, 3225, 3835, 968, 3877, 861, 4030, 557, 506, 2417, 2359, 1284, 4039, 4026, 1458, 2851, 2660, 149]]]
        cached_global_token_ids = torch.tensor(embedding_data, dtype=torch.long).to(spark_model.device)
        
        print("모델 디바이스:", next(spark_model.model.parameters()).device)
        print("토큰 디바이스:", cached_global_token_ids.device)
    
    print("[TTS] TTS 음성 생성 시작")
    t2 = time.perf_counter()

    audio_tensor = spark_model.inference(text=text, global_token_ids=cached_global_token_ids)
    
    t3 = time.perf_counter()
    print(f"[TTS] TTS 음성 생성 완료 (소요 시간: {t3 - t2:.2f}초)")
    
    print(f"[TTS] WebM chunk 변환 시작")

    # torch.Tensor → np.ndarray
    if isinstance(audio_tensor, torch.Tensor):
        audio_array = audio_tensor.cpu().numpy()
    else:
        audio_array = audio_tensor

    t4 = time.perf_counter()

    # WebM 형식 청크로 변환해서 스트리밍
    audio_array_48k = resample_audio(audio_array, orig_sr=16000, target_sr=48000)
    chunk = pcm_to_webm_chunk(audio_array_48k, sample_rate=48000)

    t5 = time.perf_counter()
    print(f"[TTS] WebM chunk 변환 완료 (소요 시간: {t5 - t4:.2f}초)")

    # 오디오 디버깅용 저장
    output_dir = Path("results")
    output_dir.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    debug_path = output_dir / f"debug_tts_{timestamp}.wav"
    write(debug_path, 16000, (audio_array * 32767).astype(np.int16))
    print(f"[TTS DEBUG] WAV 파일 저장됨: {debug_path}")

    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # output_dir = Path("results")
    # output_dir.mkdir(exist_ok=True)
    # webm_path = output_dir / f"debug_tts_{timestamp}.webm"
    # with open(webm_path, "wb") as f:
    #     f.write(chunk)
    #     print(f"[TTS DEBUG] WebM 파일 저장됨: {webm_path}")

    # print("[DEBUG] audio_tensor max:", np.max(audio_tensor))
    # print("[DEBUG] audio_tensor min:", np.min(audio_tensor))
    # print("[DEBUG] audio_tensor mean:", np.mean(audio_tensor))
    # print(f"[DEBUG] WebM chunk 크기: {len(chunk)} bytes")
    yield chunk