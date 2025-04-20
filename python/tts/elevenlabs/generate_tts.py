import os
import requests
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("MY_CLONED_VOICE_ID")

def generate_tts(text, output_path="output.wav"):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.6,
            "similarity_boost": 0.75
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        with open(output_path, "wb") as f:
            f.write(response.content)
        print(f"음성 생성 완료: {output_path}")
    else:
        print(f"오류 발생: {response.status_code} {response.text}")

# 예제 실행
generate_tts("그려그려. 밥은 먹었냐? 잘 지내고 있는 거지? 아픈데는 없고?")
