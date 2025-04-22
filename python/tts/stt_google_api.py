import os
import asyncio
from dotenv import load_dotenv
from google.cloud import speech_v1p1beta1 as speech
from pathlib import Path


load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
# if cred_path is None:
#     raise ValueError("GOOGLE_APPLICATION_CREDENTIALS is not set in .env")
# else:
#     print("[DEBUG] GOOGLE_APPLICATION_CREDENTIALS =", cred_path)

# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred_path

client = speech.SpeechClient()

config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
    sample_rate_hertz=16000,
    language_code="ko-KR",
)

streaming_config = speech.StreamingRecognitionConfig(
    config=config,
    interim_results=True,  # 중간 결과도 받을 수 있도록 설정
    single_utterance=False,
)


# 동기 generator
def stt_streaming_generator(audio_chunks):
    buffer = b""
    min_chunk_size = 3200
    total_chunks = 0

    for idx, chunk in enumerate(audio_chunks):
        total_chunks += 1        
        if chunk is None:
            print("[STT] STT 종료: None 수신")
            if buffer:
                yield speech.StreamingRecognizeRequest(audio_content=buffer)
            break

        buffer += chunk

        if len(buffer) >= min_chunk_size:
            yield speech.StreamingRecognizeRequest(audio_content=buffer)
            buffer = b""

# 비동기 wrapper 함수
async def run_streaming_stt(audio_queue: asyncio.Queue):
    loop = asyncio.get_event_loop()
    audio_chunks = []
    
    print("[STT] 오디오 큐 시작")

    while True:
        chunk = await audio_queue.get()
        
        if chunk is None:
            print("[STT] 오디오 큐 종료 신호 수신 (None)")
            audio_chunks.append(None)
            break
        
        audio_chunks.append(chunk)

    def _call_google_stt():
        try:
            print("[STT] Google STT 호출 시작")
            return client.streaming_recognize(streaming_config, stt_streaming_generator(audio_chunks))
        except Exception as e:
            print(f"[STT] Google STT 호출 실패: {e}")
            return None

    # 동기 함수 백그라운드에서 실행
    print("[STT] Google STT 호출 시작")
    responses = await loop.run_in_executor(None, _call_google_stt)

    if responses is None:
        raise RuntimeError("[STT] Google STT 요청 실패: 응답이 없습니다")

    return responses