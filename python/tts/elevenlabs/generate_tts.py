import requests
import os
from dotenv import load_dotenv


load_dotenv()



def generate_tts_audio(reply_text: str) -> bytes:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = "Y0kMLRNxCTef2wtDgX1R"
    model_id = "eleven_multilingual_v2"

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "accept": "audio/mpeg",
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "text": reply_text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.4,
            "similarity_boost": 0.85
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.content
    else:
        print("[TTS 오류]", response.status_code, response.text)
        return None