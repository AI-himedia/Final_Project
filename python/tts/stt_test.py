import os
from dotenv import load_dotenv
import pyaudio
from six.moves import queue
from google.cloud import speech



load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")


# 연결된 마이크 장치 확인
p = pyaudio.PyAudio()
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f" {i}: {info['name']} (Input Channels: {info['maxInputChannels']})")


# 오디오 스트림 설정
RATE = 16000
CHUNK = int(RATE / 5)  # 200ms

class MicrophoneStream:
    def __init__(self, rate, chunk):
        self._rate = rate
        self._chunk = chunk
        self._buff = queue.Queue()
        self.closed = True

    def __enter__(self):
        self._audio_interface = pyaudio.PyAudio()
        print("마이크 스트림 열기 시도 중...")
        self._audio_stream = self._audio_interface.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self._rate,
            input=True,
            input_device_index=15,  # 마이크 인덱스
            frames_per_buffer=self._chunk,
            stream_callback=self._fill_buffer
        )
        print("마이크 스트림 연결 완료")
        self.closed = False
        return self


    def __exit__(self, exc_type, exc_value, traceback):
        self._audio_stream.stop_stream()
        self._audio_stream.close()
        self.closed = True
        self._buff.put(None)
        self._audio_interface.terminate()

    def _fill_buffer(self, in_data, frame_count, time_info, status_flags):
        self._buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self):
        while not self.closed:
            chunk = self._buff.get()
            if chunk is None:
                return
            yield chunk

def listen_print_loop(responses):
    print("STT 응답 수신 시작")
    
    final_transcript = ""

    for response in responses:
        if not response.results:
            continue
        result = response.results[0]
        if not result.alternatives:
            continue

        transcript = result.alternatives[0].transcript

        if result.is_final:
            print("최종 인식:", transcript)
            break
        else:
            print("중간 인식:", transcript)
    
    return final_transcript


def run_stt_from_mic() -> str:
    
    print("마이크 입력을 시작")
    client = speech.SpeechClient()

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=RATE,
        language_code="ko-KR", 
        enable_automatic_punctuation=True,
    )

    streaming_config = speech.StreamingRecognitionConfig(
        config=config,
        interim_results=True,  # 중간 인식 결과 출력
    )

    with MicrophoneStream(RATE, CHUNK) as stream:
        audio_generator = stream.generator()
        requests = (
            speech.StreamingRecognizeRequest(audio_content=chunk) 
            for chunk in audio_generator
        )
        responses = client.streaming_recognize(streaming_config, requests)

        listen_print_loop(responses)


if __name__ == "__main__":
    result = run_stt_from_mic()
    print("STT 결과:", result)
