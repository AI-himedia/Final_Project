import os
import queue
from dotenv import load_dotenv
from google.cloud import speech_v1p1beta1 as speech
from typing import Generator

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
    interim_results=True,  # 중간 결과도 받을 수 있도록 설정
)

# 디버깅용 raw 오디오 저장 함수
def save_debug_audio(chunk: bytes):
    os.makedirs("debug_audio", exist_ok=True)
    raw_path = "debug_audio/input_audio.raw"
    with open(raw_path, "ab") as f:
        f.write(chunk)


def stt_streaming_generator(audio_queue: queue.Queue) -> Generator:
    print("[STT Generator 시작]")
    buffer = b""
    min_chunk_size = 1024  # 너무 작으면 timeout 가능성 있으니 일정 크기 보장

    while True:
        chunk = audio_queue.get()

        if chunk is None:
            print("Generator 종료 신호 수신]")
            if buffer:
                yield speech.StreamingRecognizeRequest(audio_content=buffer)
            break

        save_debug_audio(chunk)  # 디버깅용 저장
        buffer += chunk

        if len(buffer) >= min_chunk_size:
            print(f"[Generator] 수신 chunk: {len(buffer)} bytes")
            yield speech.StreamingRecognizeRequest(audio_content=buffer)
            buffer = b""  # 버퍼 초기화



# # STT용 generator (오디오 chunk를 하나씩 넘김)
# def stt_streaming_generator(audio_queue: queue.Queue) -> Generator:
#     print("[STT Generator 시작]")
#     while True:
#         chunk = audio_queue.get()

#         if chunk is None:
#             print("[Generator 종료 신호 수신]")
#             break

#         print(f"[Generator] 수신 chunk: {len(chunk)} bytes")

#         # 디버그용: 저장
#         save_debug_audio(chunk)

#         yield speech.StreamingRecognizeRequest(audio_content=chunk)



# Google STT Streaming API 호출 함수
def run_streaming_stt(audio_queue: queue.Queue):
    print("STT 요청 시작")
    return client.streaming_recognize(
        streaming_config,
        stt_streaming_generator(audio_queue)
    )


