import os
import sys
import subprocess
import wave
import numpy as np
from huggingface_hub import snapshot_download
from pydub import AudioSegment


prompt = AudioSegment.from_wav("processed_prompt.wav")
print(f"🕐 프롬프트 길이: {len(prompt)} ms")

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

# 사용자 지정 경로
ORIGINAL_AUDIO_PATH = r"C:\Users\201-03\Desktop\wav\smple.wav"
PROCESSED_AUDIO_PATH = os.path.join(current_dir, "processed_prompt.wav")
MODEL_SAVE_DIR = os.path.join(project_root, "pretrained_models", "Spark-TTS-0.5B")
OUTPUT_DIR = os.path.join(current_dir, "results")

print(f"✅ PROCESSED_AUDIO_PATH: {PROCESSED_AUDIO_PATH}")

if not os.path.exists(PROCESSED_AUDIO_PATH):
    print("❌ 변환된 오디오 파일이 존재하지 않습니다!")
else:
    audio = AudioSegment.from_wav(PROCESSED_AUDIO_PATH)
    print(f"🕐 오디오 길이: {len(audio)}ms")

    if len(audio) == 0:
        print("❌ 오디오가 비어 있습니다!")
    else:
        print("✅ 오디오 파일이 정상입니다!")

# 작업 디렉토리 변경
os.chdir(project_root)
print(f"작업 디렉토리: {os.getcwd()}")

def process_audio(input_path, output_path):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"❌ 입력 파일이 존재하지 않습니다: {input_path}")

    original = AudioSegment.from_wav(input_path)
    print(f"🔹 원본 오디오 길이: {len(original)} ms")

    audio = original.set_frame_rate(16000).set_channels(1).set_sample_width(2)

    audio.export(output_path, format="wav")
    print(f"✅ 오디오 변환 완료: {output_path}")

    # 확인용
    processed = AudioSegment.from_wav(output_path)
    print(f"🔹 변환된 오디오 길이: {len(processed)} ms")

def validate_environment():
    if not os.path.exists(ORIGINAL_AUDIO_PATH):
        raise FileNotFoundError(f"참조 오디오 파일을 찾을 수 없습니다: {ORIGINAL_AUDIO_PATH}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"▶ 출력 디렉토리 준비 완료: {OUTPUT_DIR}")
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    print(f"▶ 모델 저장 경로 준비 완료: {MODEL_SAVE_DIR}")

def download_model():
    print("\n🔽 Spark-TTS 모델 다운로드 시작...")
    snapshot_download(
        repo_id="SparkAudio/Spark-TTS-0.5B",
        local_dir=MODEL_SAVE_DIR,
        repo_type="model"
    )
    print("✅ 모델 다운로드 완료")

def detect_gender(audio_path: str) -> str:
    with wave.open(audio_path, 'rb') as wav_file:
        framerate = wav_file.getframerate()
        n_frames = wav_file.getnframes()
        audio_data = wav_file.readframes(n_frames)
        audio_np = np.frombuffer(audio_data, dtype=np.int16)

        fft_spectrum = np.fft.fft(audio_np)
        freqs = np.fft.fftfreq(len(fft_spectrum), d=1.0 / framerate)
        magnitude = np.abs(fft_spectrum)

        positive_freqs = freqs[:len(freqs)//2]
        positive_magnitude = magnitude[:len(magnitude)//2]

        peak_freq = positive_freqs[np.argmax(positive_magnitude)]

        gender = "male" if peak_freq < 170 else "female"
        print(f"🎧 예측된 성별: {gender} (주파수 기준: {peak_freq:.1f}Hz)")
        return gender

def run_inference():
    gender = detect_gender(PROCESSED_AUDIO_PATH)

    # 클로닝 기반 방식 사용 시: 스타일 제어는 끔
    USE_STYLE_CONTROL = False

    command = [
        sys.executable,
        "-m", "cli.inference",
        "--text", "한국어와 숫자 30과 English test model 가능한지?",
        "--device", "0", 
        "--save_dir", OUTPUT_DIR,
        "--model_dir", MODEL_SAVE_DIR,
        "--prompt_speech_path", PROCESSED_AUDIO_PATH
    ]

    if USE_STYLE_CONTROL:
        command += [
            "--gender", gender,
            "--pitch", "moderate",
            "--speed", "moderate",
        ]

    print("\n🎙️ 음성 합성 시작...")
    try:
        subprocess.run(command, check=True)
        print(f"\n✅ 완료! 생성된 파일: {os.path.join(OUTPUT_DIR, 'output.wav')}")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ 오류 발생: {e}")

if __name__ == "__main__":
    try:
        validate_environment()
        process_audio(ORIGINAL_AUDIO_PATH, PROCESSED_AUDIO_PATH)
        download_model()
        run_inference()
    except Exception as e:
        print(f"\n⚠️ 치명적 오류: {str(e)}")