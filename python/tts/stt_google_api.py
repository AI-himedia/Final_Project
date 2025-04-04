import os
import queue
from dotenv import load_dotenv
from google.cloud import speech_v1p1beta1 as speech


load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")


client = speech.SpeechClient()

config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
    sample_rate_hertz=44100,
    language_code="ko-KR",
)

streaming_config = speech.StreamingRecognitionConfig(
    config=config,
    interim_results=True,
)

def stt_streaming_generator(audio_queue: queue.Queue):
    """
    Google STT가 읽을 수 있는 generator 반환
    """
    while True:
        chunk = audio_queue.get()
        if chunk is None:
            break
        yield speech.StreamingRecognizeRequest(audio_content=chunk)

def run_streaming_stt(audio_queue: queue.Queue):
    """
    Google STT 스트리밍 호출
    :param audio_queue: 클라이언트로부터 실시간으로 들어오는 오디오 chunk
    :return: responses (generator 형태)
    """
    return client.streaming_recognize(streaming_config, stt_streaming_generator(audio_queue))
