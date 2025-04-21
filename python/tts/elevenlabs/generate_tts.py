# import os
# import requests
# from dotenv import load_dotenv


# load_dotenv()
# API_KEY = os.getenv("ELEVENLABS_API_KEY")
# VOICE_ID = os.getenv("MY_CLONED_VOICE_ID")

# def generate_tts(text, output_path="output.wav"):
#     url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
#     headers = {
#         "xi-api-key": API_KEY,
#         "Content-Type": "application/json"
#     }
#     payload = {
#         "text": text,
#          "model_id": "eleven_multilingual_v2",
#             "voice_settings": {
#                 "stability": 0.4,
#                 "similarity_boost": 0.85
#             }
#     }

#     response = requests.post(url, headers=headers, json=payload)

#     if response.status_code == 200:
#         with open(output_path, "wb") as f:
#             f.write(response.content)
#         print(f"음성 생성 완료: {output_path}")
#     else:
#         print(f"오류 발생: {response.status_code} {response.text}")

# # 예제 실행
# generate_tts("그려그려. 밥은 먹었냐? 잘 지내고 있는 거지? 아픈데는 없고?")

import requests
import base64
import json
import os
from dotenv import load_dotenv


load_dotenv()


# API_KEY = os.getenv("ELEVENLABS_API_KEY")
# VOICE_ID = "Y0kMLRNxCTef2wtDgX1R"
# url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

# headers = {
#     "xi-api-key": API_KEY,
#     "Content-Type": "application/json"
# }

# data = {
#     "text": "그려그려. 밥은 먹었냐? 잘 지내고 있는 거지? 아픈데는 없고?",
#     "model_id": "eleven_multilingual_v2",
#     "voice_settings": {
#         "stability": 0.4,
#         "similarity_boost": 0.85
#     }
# }

# response = requests.post(url, headers=headers, json=data)

# with open("output.wav", "wb") as f:
#     f.write(response.content)


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