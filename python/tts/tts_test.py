import os
import sys
import subprocess
import base64
from huggingface_hub import snapshot_download
from pydub import AudioSegment

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

PROCESSED_AUDIO_PATH = os.path.join(current_dir, "processed_prompt.wav")
ORIGINAL_AUDIO_PATH = r"C:\Users\201-06\Desktop\sample.wav"  # 실제 경로
MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")
OUTPUT_AUDIO_PATH = os.path.join(OUTPUT_DIR, "output.wav")


# LLM 더미 응답 생성
def run_llm(text: str) -> str:
    dummy_responses = {
        "안녕": "안녕하세요! 무엇을 도와드릴까요?",
        "시간": "지금은 오후 3시입니다.",
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
 

# TTS 합성 및 바이트 반환
def run_tts(text: str) -> bytes:
    ensure_environment_ready()

    command = [
        sys.executable,
        "-m", "cli.inference",
        "--text", text,
        "--device", "0",
        "--save_dir", OUTPUT_DIR,
        "--model_dir", MODEL_SAVE_DIR,
        "--prompt_speech_path", PROCESSED_AUDIO_PATH
    ]

    try:
        subprocess.run(command, check=True)
        print(f"TTS 생성 완료: {OUTPUT_AUDIO_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"TTS 생성 실패: {e}")
        return b""

    if not os.path.exists(OUTPUT_AUDIO_PATH):
        print("output.wav 파일 없음")
        return b""

    with open(OUTPUT_AUDIO_PATH, "rb") as f:
        return f.read()
