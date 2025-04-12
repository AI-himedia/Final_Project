import wave

# raw 파일 파라미터 설정
INPUT_FILE = "recorded_audio.raw"
OUTPUT_FILE = "converted_output.wav"
SAMPLE_WIDTH = 2          # 16-bit = 2 bytes
CHANNELS = 1              # 모노
SAMPLE_RATE = 48000       # AudioWorklet 기본값 (혹은 16000 등)

with open(INPUT_FILE, "rb") as raw_file:
    raw_data = raw_file.read()

with wave.open(OUTPUT_FILE, "wb") as wav_file:
    wav_file.setnchannels(CHANNELS)
    wav_file.setsampwidth(SAMPLE_WIDTH)
    wav_file.setframerate(SAMPLE_RATE)
    wav_file.writeframes(raw_data)

print(f"{OUTPUT_FILE} 생성 완료!")
