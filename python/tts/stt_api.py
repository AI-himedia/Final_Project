import os
from dotenv import load_dotenv
from google.cloud import speech_v1p1beta1 as speech


load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

client = speech.SpeechClient()

config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
    sample_rate_hertz=16000,
    language_code="ko-KR",
)

streaming_config = speech.StreamingRecognitionConfig(
    config=config,
    interim_results=True,
    single_utterance=True,
)


# 동기 generator
def stt_streaming_generator(audio_queue):
    print("[STT Generator 시작]")
    buffer = b""
    min_chunk_size = 1024

    while True:
        chunk = audio_queue.get()
        if chunk is None:
            print("STT 종료: None 수신")
            if buffer:
                print(f"[STT Generator] 마지막 버퍼 전송: {len(buffer)} bytes")
                yield speech.StreamingRecognizeRequest(audio_content=buffer)
            break

        idx += 1
        buffer += chunk
        print(f"[STT Generator] #{idx} 수신 chunk: {len(chunk)} bytes → 누적: {len(buffer)} bytes")

        if len(buffer) >= min_chunk_size:
            print(f"[STT Generator] Google STT에 전송: {len(buffer)} bytes")
            yield speech.StreamingRecognizeRequest(audio_content=buffer)
            buffer = b""


def run_streaming_stt(audio_queue):
    try:
        print("[STT] Google STT 호출 시작")
        responses = client.streaming_recognize(streaming_config, stt_streaming_generator(audio_queue))
        return responses  # generator 그대로 반환
    except Exception as e:
        print(f"[STT] Google STT 호출 실패: {e}")
        return []