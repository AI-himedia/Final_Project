import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
from huggingface_hub import snapshot_download
from pathlib import Path
import torch
from tts.cli.SparkTTS import SparkTTS
from dotenv import load_dotenv

load_dotenv()


# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)


MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")


# 캐시용 전역 변수
spark_model = None


# 모델 다운로드 준비
def ensure_environment_ready():
    if not os.path.exists(MODEL_SAVE_DIR) or not os.path.exists(os.path.join(MODEL_SAVE_DIR, "config.json")):
        print("Spark-TTS 모델 다운로드 시작")
        snapshot_download(
            repo_id="SparkAudio/Spark-TTS-0.5B",
            local_dir=MODEL_SAVE_DIR,
            repo_type="model"
        )
        print("모델 다운로드 완료")
    else:
        print(":흰색_확인_표시: 이미 모델이 존재합니다. 다운로드 생략.")
    os.makedirs(OUTPUT_DIR, exist_ok=True)



# 모델 로딩
def ensure_model_loaded():
    global spark_model
    ensure_environment_ready()  # 모델 파일이 없다면 다운로드

    if spark_model is None:
        print("모델 메모리 로딩 시작")
        
        # 배포 테스트로 잠시 GPU 이용
        # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print("cuda ???? :",torch.cuda.is_available())
        # device = torch.device("cpu")
        device = torch.device("cuda")
        
        spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)
        print("모델 로딩 완료")
        return spark_model


# 로딩된 모델 반환
def get_loaded_model():
    global spark_model
    return spark_model

