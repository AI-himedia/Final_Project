from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import AIMessage, HumanMessage
from llm.chat.prompt_template import SYSTEM_PROMPT_TEMPLATE 
from llm.chat.chain_config import get_llm_and_prompt
from llm.chat.memory_chain import MyChatChain
from model.embedding_model import embedding_model
from llm.models.request_models import ChatRequest
from db.query_utils import fetch_prompt_data, get_similar_messages_with_embedding, get_vector, save_results_to_postgres, save_model_summary_to_postgres
from config.redis_config import redis_client
import time
import traceback # 에러 로깅
import logging
from typing import Optional 
import numpy as np
from llm.data.test_dataset import test_set
from bert_score import score
from accelerate import init_empty_weights
from llm.models.request_models import TestRequest
from llm.services.toxicity_check import get_toxicity_score
import csv
import os

def save_test_results_to_csv(results, filename="test_results.csv"):
    fieldnames = [
        "model", "test_name", "user_input", "expected", "generated",
        "precision", "recall", "f1", "response_time"
    ]

    # CSV가 없으면 헤더 포함해서 새로 생성
    write_header = not os.path.exists(filename)

    with open(filename, mode="a", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if write_header:
            writer.writeheader()
        for row in results:
            writer.writerow(row)





load_dotenv()
test_router = APIRouter()

from langchain_core.runnables import RunnableWithMessageHistory
from llm.chat.redis_chat_message_history import RedisChatMessageHistory
import redis

class MyChatChain2:
    def __init__(self, base_chain, deceased_code_map: dict, redis_client: redis.Redis):
        self.deceased_code_map = deceased_code_map
        self.redis_client = redis_client  # Redis 클라이언트를 여기서 저장
        self.chat_history_instance = None      # Redis + DB 저장을 위한 메시지 기록 관리 객체
        self.session_id_cache = None

        self.chain = RunnableWithMessageHistory(
            runnable=base_chain, # 동적으로 생성된 체인을 이곳에 설정
            get_session_history=self.get_memory,
            # input_messages_key="input",
            # MessagesPlaceholder 변수 이름과 일치하도록 설정
            history_messages_key="messages"
        )

    def get_memory(self, session_id):
        # 중복 호출 방지
        if self.chat_history_instance and self.session_id_cache == session_id:
            return self.chat_history_instance.messages

        # session_id를 int로 변환하여 조회하도록 처리, 변환 실패시 예외 처리
        try:
            session_id_int = int(session_id)
        except ValueError:
            raise ValueError(f"Invalid session_id format, expected integer representable string: {session_id}")

        print("session_id in get_memory:", session_id)
        deceased_code = self.deceased_code_map.get(session_id_int)

        if deceased_code is None: # None에 대한 명시적 확인
            # 키가 누락된 경우, 맵 내용 로그로 디버깅
            print(f"Debug: deceased_code_map content: {self.deceased_code_map}")
            raise ValueError(f"deceased_code not found for session_id: {session_id} (int: {session_id_int})")
        else:
            print("deceased_code:", deceased_code)

        
        # RedisChatMessageHistory를 사용하여 Redis에서 대화 이력 조회
        self.chat_history_instance = RedisChatMessageHistory(session_id, deceased_code, self.redis_client)
        self.session_id_cache = session_id
        
        # Redis에서 대화 기록을 조회하여 반환
        return self.chat_history_instance
        # # YourPostgresChatMessageHistory가 session_id를 문자열로 기대하는 경우 문자열로 전달
        # return YourPostgresChatMessageHistory(
        #     session_id=str(session_id),
        #     deceased_code=deceased_code
        # )

    def invoke(self, inputs, config=None):
        print(f"Invoking chain with inputs: {inputs.keys()}, config: {config}")
        return self.chain.invoke(inputs, config=config)


import os
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_perplexity import ChatPerplexity
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

MODEL_LLMS = {
    "openai": ChatOpenAI(
        model="gpt-4.1-nano",
        temperature=0.5,
        verbose=True # For LangChain callbacks
    ),
    "claude": ChatAnthropic(
        model="claude-3-7-sonnet-20250219",
        # max_tokens=200, 
        temperature=0.4,
    ),
    "sonar": ChatPerplexity(
        model="sonar",
        temperature=0.4,
        # max_tokens=1024, 
    )
}

# 모델 이름과 버전 매핑 딕셔너리
MODEL_NAMES = {
    "openai": "gpt-4.1-nano",
    "claude": "claude-3-7-sonnet-20250219",
    "sonar": "sonar"
}

prompt = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"), 
    # MessagesPlaceholder(variable_name="retrieved"),   # 과거 유사 메시지
    MessagesPlaceholder(variable_name="messages"),    # Redis 대화 기록
    ("human", "{input}") 
])

# --- Function to get LLM and Prompt ---
def get_llm_and_prompt2(model_choice: str):
    """
    Selects the LLM instance based on the model_choice.
    Returns the selected LLM and the common prompt template.
    """
    llm = MODEL_LLMS.get(model_choice.lower())
    if not llm:
        raise ValueError(f"Unsupported model choice: {model_choice}. Choose from {list(MODEL_LLMS.keys())}")
    
    model_name_version = MODEL_NAMES.get(model_choice.lower())

    # 모델에 따라서 다른 prompt 로 갈아 끼워 주고 있지 않다
    # 추후 모델 맞춤 prompt 가 작성되면 수정하도록 하자
    return llm, model_name_version, prompt




model_choices = ["openai", "claude"]



@test_router.post("/ai/single_response_test")
def generate_response_for_single_io(request: TestRequest):
    
    # subscription_code = request.subscriptionCode
    
    chosen_model: str

    for index,test in enumerate(test_set):
        subscription_code = index + 1

        try:
            # 1. DB에서 prompt용 정보 조회
            prompt_data = fetch_prompt_data(subscription_code)
            if not prompt_data:
                raise HTTPException(status_code=404, detail=f"Prompt data not found for subscription code: {subscription_code}")
            # 조회해온 고인코드 일단 저장
            deceased_code = prompt_data["deceased_code"]

        
            # 3. system prompt 생성
            try:
                system_prompt = SYSTEM_PROMPT_TEMPLATE.format(**prompt_data)
                print("------------------------------------------")
                print('system_prompt:', system_prompt)
            except KeyError as e:
                raise HTTPException(status_code=500, detail=f"Missing key for system prompt formatting: {e}")

            all_model_results = {}
            test_logs = []
            # model_f1_avg_score={"avg_precision":0.0, "avg_recall":0.0, "avg_f1":0.0}

            # 4. 모델을 순차적으로 시도 (openai -> claude -> sonar)
            for model in model_choices:
                start_time = time.time()
                precision_total, recall_total, f1_total = 0, 0, 0
                toxicity_num = 0
                num_tests = len(test)
            
                for st in test:
                    try:
                        test_start_time = time.time()
                        # 5. LLM 모델과 그에 맞는 프롬프트 템플릿
                        selected_llm, model_name_version, selected_prompt = get_llm_and_prompt2(model)
                    
                        # 6. chain 조립
                        base_chain = selected_prompt | selected_llm

                        user_input = st["user_input"]

                        # 7. runnable + memory + invoke
                        inputs = {
                            "system_prompt": system_prompt,
                            "input": user_input
                        }

                        config = RunnableConfig(configurable={"session_id": str(subscription_code)}) 
                        
                        # 8. 동적으로 생성된 base_chain을 사용하여 MyChatChain 인스턴스화
                        # redis_config.py에서 생성한 redis_client는 전역 인스턴스
                        chat_chain = MyChatChain2(
                            base_chain=base_chain, # 동적으로 생성된 chain 전달
                            deceased_code_map={subscription_code: deceased_code},
                            redis_client=redis_client # 생성한 redis_client 전달
                        )

                        # 9. 체인 실행
                        ai_response = chat_chain.invoke(inputs, config=config)

                        # 10. 유효한 응답 내용 체크
                        if ai_response is None or not hasattr(ai_response, 'content') or not ai_response.content:
                            raise ValueError(f"Model {model} returned empty or invalid response.")
                        
                        
                        ai_response = ai_response.content

                        P, R, F1 = score([ai_response], [st["expected_response"]], lang="ko")

                        toxicity = get_toxicity_score(ai_response)
            
                        # 개별 결과 출력
                        print(f"\n=== Test Case: {user_input} ===")
                        print(f"Toxicity Score: {toxicity:.4f}")
                        print(f"Expected: {st['expected_response']}")
                        print(f"Generated: {ai_response}")
                        print(f"BERT Score - Precision: {P.item():.4f}, Recall: {R.item():.4f}, F1: {F1.item():.4f}")
                        
                        # 누적 점수 계산
                        precision_total += P.item()
                        recall_total += R.item()
                        f1_total += F1.item()

                        if toxicity >= 0.3:
                            toxicity_num += 1

                        test_logs.append({
                            "model": model_name_version,
                            "test_name": st.get("test_name", ""),
                            "user_input": user_input,
                            "expected": st["expected_response"],
                            "generated": ai_response,
                            "precision": P.item(),
                            "recall": R.item(),
                            "f1": F1.item(),
                            "toxicity": toxicity,
                            "response_time": time.time() - test_start_time,
                        })

                    except (ValueError, Exception) as e:
                        # 각 모델에서 오류가 나면 계속해서 다음 모델로 재시도
                        print(f"Error with model {model}: {e}")

                model_runs_time = time.time() - start_time
                
                all_model_results[model_name_version] = {
                    "avg_precision": precision_total / num_tests,
                    "avg_recall": recall_total / num_tests,
                    "avg_f1": f1_total / num_tests,
                    "toxicity_num": toxicity_num,
                    "time_taken": model_runs_time,
                    "avg_time_per_trial": model_runs_time / num_tests,
                }

            save_test_results_to_csv(test_logs)
            save_results_to_postgres(test_logs)

            test_batch_id = f"{test[0]['scenario']}_{test[0]['persona']}"

            save_model_summary_to_postgres(all_model_results, test_batch_id)

                

        except HTTPException as http_exc:
            # HTTP 예외는 직접 다시 발생시킴
            raise http_exc
        except Exception as e:
            # 전체 에러를 로깅
            print(f"ERROR generating response: {e}")
            logging.error(f"ERROR generating response: {e}", exc_info=True)
            # 일반적인 서버 에러 반환
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    end_time = time.time()
    time_taken = end_time - start_time
    print("------------------------------------------")
    print("현재 작업 디렉토리:", os.getcwd())


    return {"status": "success", "message": all_model_results}