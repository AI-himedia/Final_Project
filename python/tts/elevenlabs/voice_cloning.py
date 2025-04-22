import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("ELEVENLABS_API_KEY")


# 1. 업로드할 화자 정보
VOICE_NAME = "코딩"  # 원하는 이름으로 설정
VOICE_DESCRIPTION = "보이스 클로닝 테스트 1" 
FILE_PATH = "./voice_sample/sample1.mp3"  # 경로 확인 필수

# 2. API 요청 설정
url = "https://api.elevenlabs.io/v1/voices/add"
headers = {
    "xi-api-key": API_KEY
}

files = {
    "name": (None, VOICE_NAME),
    "description": (None, VOICE_DESCRIPTION),
    "files": (os.path.basename(FILE_PATH), open(FILE_PATH, "rb"), "audio/mpeg")
}

# 3. 요청 보내기
response = requests.post(url, headers=headers, files=files)

# 4. 결과 확인
if response.status_code == 200:
    result = response.json()
    print("클로닝 완료!")
    print("voice_id:", result["voice_id"])
else:
    print("오류 발생:", response.status_code, response.text)
