from fastapi import APIRouter, Request
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import openai
import time
from datetime import datetime
import re
import json
# import requests
# from PIL import Image, ImageDraw
# import matplotlib.pyplot as plt
import base64
import io


# .env 로드
load_dotenv()

# openai.api_key = os.environ["OPENAI_API_KEY"]
client = openai.OpenAI()

# def parse_gpt_json_response(text: str) -> dict:
#     """
#     LLM 응답을 정규식 적용해서 JSON 만 파싱해서 return 하는 함수
#     """
#     response_text = text.strip()
#     json_match = re.search(r'\{[\s\S]*\}', response_text)

#     if json_match:
#         json_text = json_match.group(0)
#         try:
#             return json.loads(json_text)
#         except json.JSONDecodeError as e:
#             print("!!!!!!!!JSON 파싱 실패:")
#             print(json_text)
#             raise
#     else:
#         raise ValueError("!!!!!JSON 블록을 찾을 수 없습니다.")

# sms_init_router = APIRouter()

# # 요청 데이터 구조 정의
# class ChatRequest(BaseModel):
#     chatData: str

# @sms_init_router.post("/chat-tone-analysis")
# async def analyze_chat(data: ChatRequest):
#     url = data.chatData
#     print(url)
#     start_time = time.time()

#     # 대화록.txt 불러와서 읽기
#     with open(url, "r", encoding="utf-8") as f:
#         chat_log = f.read()

#     # prompt
#     messages = [
#     {
#         "role": "system",
#         "content": (
#             "당신은 언어 분석 전문가입니다. 다음은 두 사람(Joon과 진원) 사이의 실제 카카오톡 대화입니다.\n"
#             "'진원'은 세상을 떠난 인물이며, 이 사람의 말투, 언어 습관, 감정 표현, 자주 사용하는 말투 등을 분석하여 "
#             "AI 아바타로 구현하기 위한 정보를 추출해야 합니다.\n\n"
#             "분석 결과는 반드시 다음의 JSON 형식으로 출력해주세요. 모든 항목은 문자열로 작성하세요:\n\n"
#             "응답은 반드시 JSON 형식 만 출력하세요. 다른 설명이나 문장은 포함하지 마세요.\n\n"
#             "{\n"
#             "  \"tone_style\": \"\",\n"
#             "  \"common_phrases\": [\"\", \"\"],\n"
#             # "  \"감정적_특성\": \"\",\n"
#             # "  \"말의_습관\": [\"\", \"\"],\n"
#             "  \"example_lines\": [\"\", \"\"]\n"
#             "}\n"
#         )
#     },
#     {
#         "role": "user",
#         "content": f"다음은 대화 내용입니다:\n\n[대화 시작]\n{chat_log}\n[대화 끝]"
#     }
# ]


#     # LLM request and response
#     response = client.chat.completions.create(
#         model="gpt-4o-mini",  # Or use "gpt-3.5-turbo" if you're not using GPT-4
#         messages=messages,
#         temperature=0.7  # Optional: adjust creativity
#     )

#     end_time = time.time()
#     # 성능 계산용 시간 체크
#     time_taken = end_time - start_time

#     # result , 소요시간
#     response_text = response.choices[0].message.content
#     print("------------------------------------------")
#     print(response_text)
#     print("------------------------------------------")
#     print('Time Taken (seconds):', time_taken)
#     print('local time:', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

#     parsed_result = parse_gpt_json_response(response_text)
#     print(parsed_result)
#     print(parsed_result["tone_style"])
#     print(parsed_result["common_phrases"])

    
#     return parsed_result


from fastapi import APIRouter
from llm.models.request_models import ServiceStartRequest
from llm.services import file_loader, llm_prompt, llm_executor, result_parser, db_writer

router = APIRouter()

@router.post("/sms/service/start")
async def start_service(req: ServiceStartRequest):
    try:
        # 리스트 
        combined_text = file_loader.load_combined_text(req.chatFileUrls)
        
        prompt = llm_prompt.build_prompt(combined_text)
        llm_result = llm_executor.run_analysis(prompt)
        parsed = result_parser.parse_response(llm_result)

        db_writer.save_all_to_db(req.subscriptionCode, parsed, req.chatFileUrls[0])
        return {"status": "success"}

    except Exception as e:
        print(" 에러 발생:", e)
        return {"status": "error", "message": str(e)}
