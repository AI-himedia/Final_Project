from fastapi import APIRouter, Request
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import openai
import time
from datetime import datetime
# import requests
# from PIL import Image, ImageDraw
# import matplotlib.pyplot as plt
import base64
import io


# def analyze_chat_tone_by_LLM(url):

# .env 로드
load_dotenv()

openai.api_key = os.environ["OPENAI_API_KEY"]
print(f"[API KEY]\n{openai.api_key}")


client = openai.OpenAI()

sms_router = APIRouter()

# 요청 데이터 구조 정의
class ChatRequest(BaseModel):
    chatData: str

@sms_router.post("/chat-tone-analysis")
async def analyze_chat(data: ChatRequest):
    url = data.chatData
    print(url)
    start_time = time.time()

    # 대화록.txt 불러와서 읽기
    with open(url, "r", encoding="utf-8") as f:
        chat_log = f.read()

    # prompt
    messages = [
    {
        "role": "system",
        "content": (
            "당신은 언어 분석 전문가입니다. 다음은 두 사람(Joon과 진원) 사이의 실제 카카오톡 대화입니다.\n"
            "'진원'은 세상을 떠난 인물이며, 이 사람의 말투, 언어 습관, 감정 표현, 자주 사용하는 말투 등을 분석하여 "
            "AI 아바타로 구현하기 위한 정보를 추출해야 합니다.\n\n"
            "분석 결과는 반드시 다음의 JSON 형식으로 출력해주세요. 모든 항목은 문자열 또는 문자열 리스트로 작성하세요:\n\n"
            "{\n"
            "  \"말투\": \"\",\n"
            "  \"자주_쓰는_표현\": [\"\", \"\"],\n"
            "  \"감정적_특성\": \"\",\n"
            "  \"말의_습관\": [\"\", \"\"],\n"
            "  \"시뮬레이션_문장\": [\"\", \"\"]\n"
            "}\n"
        )
    },
    {
        "role": "user",
        "content": f"다음은 대화 내용입니다:\n\n[대화 시작]\n{chat_log}\n[대화 끝]"
    }
]


    # LLM request and response
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Or use "gpt-3.5-turbo" if you're not using GPT-4
        messages=messages,
        temperature=0.7  # Optional: adjust creativity
    )

    end_time = time.time()
    # 성능 계산용 시간 체크
    time_taken = end_time - start_time

    # 🖨️ Print the result
    response_text = response.choices[0].message.content
    print("------------------------------------------")
    print(response_text)
    print("------------------------------------------")
    print('Time Taken (seconds):', time_taken)
    print('local time:', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    return {response_text}