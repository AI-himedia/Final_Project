import torch
from TTS.api import TTS

# TTS API를 사용하여 모델 초기화 및 음성 생성

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"
#device = "cpu"

# 모델 초기화
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

# 음성 클로닝
def synthesize(text, speaker_wav, language="ko"):
    # 텍스트를 음성으로 합성
    # wav = tts.tts(text, speaker_wav=speaker_wav, language=language)
    
    # 또는 파일로 저장
    tts.tts_to_file(text, speaker_wav=speaker_wav, language=language, file_path="final/output.wav")

# 예시 사용
synthesize("아~ 오늘 저녁에 친구들이랑 만나기로해서 지금 지하철타러 가야해...", "") # 음성 파일 경로
