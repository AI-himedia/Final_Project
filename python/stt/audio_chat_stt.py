import os
import tempfile
import subprocess
from dotenv import load_dotenv
from google.cloud import speech_v1p1beta1 as speech
from pydub import AudioSegment
from io import BytesIO


load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

client = speech.SpeechClient()

def convert_webm_to_wav(audio_bytes):
    # with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as input_file:
    #     input_file.write(audio_bytes)
    #     input_path = input_file.name
    
    # output_path = input_path.replace(".webm", ".wav")

    # subprocess.run([
    #         "ffmpeg", "-i", input_path,
    #         "-ar", "48000",
    #         "-ac", "1",
    #         "-f", "wav",       
    #         output_path,
    #         "-y"
    #     ], check=True)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".input") as f:
            f.write(audio_bytes)
            input_path = f.name

    output_path = input_path + ".wav"

    subprocess.run([
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "48000", "-ac", "1",
        "-f", "wav", output_path
    ], check=True)


    with open(output_path, "rb") as f:
        return f.read()

    

def debug_audio_volume(audio_bytes):
    audio = AudioSegment.from_file(BytesIO(audio_bytes))
    print(f"[음성채팅 STT] 녹음 길이: {len(audio)}ms, 평균 볼륨: {audio.dBFS:.2f}dB")


def run_stt(audio_bytes: bytes) -> str:
        
    debug_audio_volume(audio_bytes)
    pcm_audio = convert_webm_to_wav(audio_bytes)

    client = speech.SpeechClient()

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=48000,
        language_code="ko-KR",
    )

    audio = speech.RecognitionAudio(content=pcm_audio)

    print("[음성채팅 STT] Google STT 요청 시작")
    response = client.recognize(config=config, audio=audio)

    transcript = ""
    for result in response.results:
        alternatives = result.alternatives
        if alternatives:
            transcript += alternatives[0].transcript.strip() + " "

    print("[음성채팅 STT] 최종 인식 결과:", transcript.strip())
    return transcript.strip()