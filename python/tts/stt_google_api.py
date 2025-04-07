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
    sample_rate_hertz=48000,
    language_code="ko-KR",
)

streaming_config = speech.StreamingRecognitionConfig(
    config=config,
    interim_results=True,  # 중간 결과도 받을 수 있도록 설정
)

# 오디오 queue로부터 chunk를 읽어 Google이 요구하는 형식으로 변환
def stt_streaming_generator(audio_queue: queue.Queue) -> Generator:
    buffer = b""
    min_chunk_size = 4069   # 일정 크기 모아서 보내기

    while True:
        chunk = audio_queue.get()
        if chunk is None:
            if buffer:
                yield speech.StreamingRecognizeRequest(audio_content=buffer)
            break
        
        buffer += chunk
        
        if len(buffer) >= min_chunk_size:
            yield speech.StreamingRecognizeRequest(audio_content=buffer)
            buffer = b""  # 버퍼 초기화
        

# Streaming STT API 호출 함수
def run_streaming_stt(audio_queue: queue.Queue):
    print("구글 API 호출")
    return client.streaming_recognize(
        streaming_config, 
        stt_streaming_generator(audio_queue)
    )

