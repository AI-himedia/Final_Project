import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "cli"))
import subprocess
from huggingface_hub import snapshot_download
from pydub import AudioSegment
from pathlib import Path
import torch
from cli.SparkTTS import SparkTTS
from scipy.io.wavfile import write

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

PROCESSED_AUDIO_PATH = os.path.join(current_dir, "processed_prompt.wav")
ORIGINAL_AUDIO_PATH = r"C:/Users/201-06/Final_Project/python/tts/sample.wav"
MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")
OUTPUT_AUDIO_PATH = os.path.join(OUTPUT_DIR, "output.wav")

# 캐시용 전역 변수
spark_model = None
cached_global_token_ids = None

# 더미 LLM 함수
def run_llm(text: str) -> str:
    dummy_responses = {
        "안녕": "안녕하세요! 무엇을 도와드릴까요?, 도와드릴게 있나요?",
        "시간": "지금은 오후 5시입니다. 조금 있으면 집에 갈 수 있어요.졸리네요",
        "테스트": "이것은 테스트 음성입니다.",
    }
    for key, value in dummy_responses.items():
        if key in text:
            return value
    return f"{text}에 대한 답변이 없습니다."

# 모델 및 프롬프트 준비
def ensure_environment_ready():
    if not os.path.exists(PROCESSED_AUDIO_PATH):
        print("변환된 프롬프트 없음. 원본을 변환합니다.")
        convert_prompt_audio(ORIGINAL_AUDIO_PATH, PROCESSED_AUDIO_PATH)
    else:
        print("프롬프트 존재 확인")

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
def convert_prompt_audio(input_path, output_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_path, format="wav")
    print(f"오디오 변환 완료: {output_path}")

# TTS 합성
# TTS 합성
def run_tts(text: str) -> bytes:
    global spark_model, cached_global_token_ids

    ensure_environment_ready()

    if spark_model is None:
        print("Spark-TTS 모델 초기화")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        spark_model = SparkTTS(Path(MODEL_SAVE_DIR), device)

    if cached_global_token_ids is None:
        print("Voice cloning 최초 임베딩 생성 중")
        _, cached_global_token_ids = spark_model.process_prompt(
            text="임베딩 생성용 텍스트",
            prompt_speech_path=Path(PROCESSED_AUDIO_PATH)
        )
        print("Global token 캐싱 완료")
    else:
        print("기존 캐시된 임베딩 값 사용 중")

    print("TTS 음성 생성 중")
    wav_np = spark_model.inference(
        text=text,
        global_token_ids=cached_global_token_ids  # 캐시 재사용
    )  # 이미 numpy 반환됨

    write(OUTPUT_AUDIO_PATH, 16000, wav_np)
    print(f"TTS 생성 완료: {OUTPUT_AUDIO_PATH}")

    with open(OUTPUT_AUDIO_PATH, "rb") as f:
        return f.read()
