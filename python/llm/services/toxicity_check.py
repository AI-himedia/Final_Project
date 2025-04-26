import requests
import json
import os

# 발급받은 API 키 입력
PERSPECTIVE_API_KEY = os.getenv("PERSPECTIVE_API_KEY")

def get_toxicity_score(text):
    url = f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={PERSPECTIVE_API_KEY}"

    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "comment": {"text": text},
        "languages": ["ko", "en"],  # 한국어, 영어 둘 다 지원 가능
        "requestedAttributes": {
            "TOXICITY": {}
        }
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        result = response.json()
        score = result["attributeScores"]["TOXICITY"]["summaryScore"]["value"]
        return score
    else:
        print("API 호출 실패:", response.status_code, response.text)
        return None