from google.cloud import speech

def run_sync_stt_from_wav(wav_path):
    client = speech.SpeechClient()

    with open(wav_path, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,  # wav에 맞춤
        sample_rate_hertz=16000,  # 꼭 클라이언트와 일치해야 함!
        language_code="ko-KR"     # 한국어
    )

    response = client.recognize(config=config, audio=audio)

    if not response.results:
        print("STT 결과 없음")
    else:
        for result in response.results:
            print("STT 결과:", result.alternatives[0].transcript)

# 실행
run_sync_stt_from_wav("recorded_audio.wav")
