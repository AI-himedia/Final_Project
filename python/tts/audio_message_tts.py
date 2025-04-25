from pathlib import Path
import torch
import numpy as np
import subprocess
from model.tts_model_loader import ensure_model_loaded, get_loaded_model



# 사용자별 임베딩 값 캐시
user_embedding_cache = {}

def cache_embedding_data(subscription_code: int, embedding_data) :
    print("cache_embedding_data",embedding_data)
    tensor = torch.tensor(embedding_data, dtype=torch.long)
    user_embedding_cache[subscription_code] = tensor


def get_embedding(subscription_code: int):
    return user_embedding_cache.get(subscription_code, None)

def cache_voice_id(subscription_code: int, voice_id) :
    user_embedding_cache[subscription_code] = voice_id

def run_tts(text: str, subscription_code: int) -> bytes:
    ensure_model_loaded()
    spark_model = get_loaded_model()
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
