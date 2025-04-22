import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
from huggingface_hub import snapshot_download
from pathlib import Path
import torch
from tts.cli.SparkTTS import SparkTTS
import numpy as np
import subprocess




from db.postgresql_connector import get_db_connection
from db.query_utils import get_latest_embedding





def embedding_select(subscription_code):
    try:
        with get_db_connection() as conn:
            embedding_data = get_latest_embedding(conn, subscription_code)
        if embedding_data is None:
            return {
                "status": "error",
                "message": "해당 구독 코드에 대한 임베딩 정보가 없습니다."
            }
        # 임베딩 데이터를 캐싱하는 함수 호출
        cache_embedding_data(subscription_code ,embedding_data)

        return {
            "status": "success",
            "message": "임베딩 로딩 및 캐싱 완료"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"조회 중 오류 발생: {str(e)}"
        }
    


# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)


MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")

# 사용자별 임베딩 값 캐시
user_embedding_cache = {}

def cache_embedding_data(subscription_code: int, embedding_data) :
    tensor = torch.tensor(embedding_data, dtype=torch.long)
    user_embedding_cache[subscription_code] = tensor


def get_embedding(subscription_code: int):
    return user_embedding_cache.get(subscription_code, None)

# 모델 및 프롬프트 준비
spark_model = None

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


def ensure_model_ready():
    global spark_model
    ensure_environment_ready()
    if spark_model is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)



def run_tts(text: str, subscription_code: int) -> bytes:
    ensure_model_ready()
    embedding_select(subscription_code)
    embedding = get_embedding(subscription_code)

    if embedding is None:
        raise ValueError(f"subscription_code {subscription_code}에 대한 임베딩이 없습니다.")

    audio_tensor = spark_model.inference(text=text, global_token_ids=embedding)
    audio_array = audio_tensor
    audio_array = np.clip(audio_array, -1.0, 1.0)
    audio_array_int16 = (audio_array * 32767).astype(np.int16)

    # ffmpeg로 mp3 변환
    process = subprocess.Popen(
        ['ffmpeg', '-f', 's16le', '-ar', '16000', '-ac', '1',
         '-i', 'pipe:0', '-f', 'mp3', '-b:a', '128k', '-loglevel', 'quiet', 'pipe:1'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE
    )
    mp3_data, _ = process.communicate(audio_array_int16.tobytes())
    return mp3_data
