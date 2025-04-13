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
    single_utterance=False,
)


def stt_streaming_generator(audio_chunks):
    print("[STT Generator 시작]")
    buffer = b""
    min_chunk_size = 3200

    # 오디오 파일 저장용 (raw/pcm 형식)
    save_path = "recorded_audio.raw"  # 또는 .pcm
    with open(save_path, "ab") as audio_file:

        for idx, chunk in enumerate(audio_chunks):
            if chunk is None:
                print("STT 종료: None 수신")
                if buffer:
                    yield speech.StreamingRecognizeRequest(audio_content=buffer)
                break

            buffer += chunk

            audio_file.write(chunk)

            if len(buffer) >= min_chunk_size:
                yield speech.StreamingRecognizeRequest(audio_content=buffer)
                buffer = b""


def run_streaming_stt(audio_chunks):
    try:
        print("[STT] Google STT 호출 시작")
        responses = client.streaming_recognize(
            streaming_config,
            stt_streaming_generator(audio_chunks)  # 동기 generator
        )
        return responses
    except Exception as e:
        print(f"[STT] Google STT 호출 실패: {e}")
        return []