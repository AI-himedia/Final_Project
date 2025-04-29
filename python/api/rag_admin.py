from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import re
import json
import ast
from fastapi.encoders import jsonable_encoder
from typing import List, Optional, Dict, Any, Union
from langchain_openai import ChatOpenAI
from db.query_utils import (
    fetch_prompt_data,
    analyze_conversation,
    get_all_subscription_deceased_pairs,
    get_subscription_by_name
)
from model.embedding_model import embedding_model
from llm.services.sql_chain_util import run_nl2sql
import pandas as pd
from datetime import datetime, timedelta
import calendar

load_dotenv()
admin_router = APIRouter()

# --- 쿼리 분류 함수 ---
def classify_query_type(query: str) -> str:
    """
    쿼리 유형을 분류하는 함수

    Returns:
        str: "nl2sql", "rag", "graph", "mixed" 중 하나
    """
    print(f"[DEBUG][classify_query_type] query={query}")

    # 그래프 관련 키워드
    graph_keywords = ["그래프", "차트", "시각화", "비율", "추세", "집계해서 보여줘"]

    # RAG 관련 키워드
    rag_keywords = ["감정", "분석", "요약", "변화", "추세", "통계"]

    # 혼합 쿼리 키워드
    mixed_keywords = [
        "표와 함께", "표로 보여주고", "리스트와", "함께 분석",
        "표와 분석", "표와 요약", "표와 함께 분석", "표와 함께 요약"
    ]

    # 요약/특징/분석 관련 키워드
    summary_keywords = ["요약", "특징", "분석", "인사이트"]

    # 날짜 패턴 확인
    date_pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일'
    has_date = bool(re.search(date_pattern, query))

    is_graph_request = any(keyword in query for keyword in graph_keywords)
    is_rag_request = any(keyword in query for keyword in rag_keywords)
    is_mixed_request = any(keyword in query for keyword in mixed_keywords)
    is_summary_request = any(keyword in query for keyword in summary_keywords)

    # 1. "표"와 "분석"이 모두 들어가거나, 혼합 키워드가 있으면 mixed
    if is_mixed_request or ("표" in query and "분석" in query):
        print(f"[DEBUG][classify_query_type] => mixed")
        return "mixed"
    # 2. 그래프와 요약/특징/분석이 모두 있으면 mixed
    if is_graph_request and is_summary_request:
        print(f"[DEBUG][classify_query_type] => mixed (graph+summary)")
        return "mixed"
    # 3. 그래프와 RAG가 모두 있으면 그래프 우선
    if is_graph_request and is_rag_request:
        print(f"[DEBUG][classify_query_type] => graph")
        return "graph"
    # 4. 그래프만
    if is_graph_request:
        print(f"[DEBUG][classify_query_type] => graph")
        return "graph"
    # 5. RAG만
    if is_rag_request:
        print(f"[DEBUG][classify_query_type] => rag")
        return "rag"
    # 6. 날짜+대화/메시지
    if has_date and ("대화" in query or "메시지" in query):
        if "내용" in query and "분석" not in query and "요약" not in query:
            print(f"[DEBUG][classify_query_type] => nl2sql")
            return "nl2sql"
        print(f"[DEBUG][classify_query_type] => rag")
        return "rag"
    # 7. 기본값
    print(f"[DEBUG][classify_query_type] => nl2sql")
    return "nl2sql"

# --- 날짜 추출 함수 ---
def extract_date_from_query(query: str) -> Dict[str, str]:
    """
    쿼리에서 날짜 정보를 추출
    
    Returns:
        Dict: {"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}
    """
    # 날짜 범위 패턴 (예: "2025년 4월 21일부터 4월 23일까지")
    range_pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(?:부터|~)\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일\s*까지'
    range_match = re.search(range_pattern, query)
    
    if range_match:
        start_year, start_month, start_day = range_match.group(1), range_match.group(2), range_match.group(3)
        end_year = range_match.group(4) if range_match.group(4) else start_year
        end_month, end_day = range_match.group(5), range_match.group(6)
        
        start_date = f"{start_year}-{int(start_month):02d}-{int(start_day):02d}"
        end_date = f"{end_year}-{int(end_month):02d}-{int(end_day):02d}"
        
        return {"start_date": start_date, "end_date": end_date}
    
    # 단일 날짜 패턴 (예: "2025년 4월 23일")
    single_pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일'
    single_matches = re.findall(single_pattern, query)
    
    if single_matches:
        # 첫 번째 날짜를 시작일로, 마지막 날짜를 종료일로 설정
        first_match = single_matches[0]
        last_match = single_matches[-1]
        
        start_date = f"{first_match[0]}-{int(first_match[1]):02d}-{int(first_match[2]):02d}"
        end_date = f"{last_match[0]}-{int(last_match[1]):02d}-{int(last_match[2]):02d}"
        
        return {"start_date": start_date, "end_date": end_date}
    
    # 월 단위 패턴 (예: "2025년 4월")
    month_pattern = r'(\d{4})년\s*(\d{1,2})월'
    month_match = re.search(month_pattern, query)
    
    if month_match:
        year, month = month_match.group(1), month_match.group(2)
        # 해당 월의 첫날부터 마지막 날까지
        year_int, month_int = int(year), int(month)
        last_day = calendar.monthrange(year_int, month_int)[1]
            
        start_date = f"{year}-{month_int:02d}-01"
        end_date = f"{year}-{month_int:02d}-{last_day:02d}"
        
        return {"start_date": start_date, "end_date": end_date}
    
    return {"start_date": None, "end_date": None}

# --- 구독/고인 코드 추출 함수 ---
def extract_subscription_deceased_codes(query: str) -> List[Dict[str, int]]:
    """
    쿼리에서 subscription_code와 deceased_code 쌍을 추출
    
    Returns:
        List[Dict]: [{"subscription_code": int, "deceased_code": int}, ...]
    """
    result = []
    
    # subscription_code=X, deceased_code=Y 패턴
    pattern = r'subscription_code\s*=\s*(\d+)[,\s]*deceased_code\s*=\s*(\d+)'
    matches = re.findall(pattern, query)
    
    for sub_code, dec_code in matches:
        result.append({
            "subscription_code": int(sub_code),
            "deceased_code": int(dec_code)
        })
    
    # 이름 기반 패턴 (예: "홍길동이 구독한")
    if not result:
        name_pattern = r'([가-힣]+)(?:이|가)\s+구독한'
        name_match = re.search(name_pattern, query)
        
        if name_match:
            name = name_match.group(1)
            # 이름으로 구독 정보 조회
            subscriptions = get_subscription_by_name(name)
            for sub in subscriptions:
                result.append({
                    "subscription_code": sub["subscription_code"],
                    "deceased_code": sub["deceased_code"]
                })
    
    # 관계 기반 패턴 (예: "'할머니'와 나눈 대화")
    if not result:
        relation_pattern = r"'([가-힣]+)'(?:와|과|에게)\s+(?:나눈|보낸)"
        relation_match = re.search(relation_pattern, query)
        
        if relation_match:
            relation = relation_match.group(1)
            # 관계로 구독 정보 조회 (이 함수는 구현 필요)
            # subscriptions = get_subscription_by_relation(relation)
            # for sub in subscriptions:
            #     result.append({
            #         "subscription_code": sub["subscription_code"],
            #         "deceased_code": sub["deceased_code"]
            #     })
    
    return result

# --- 감정 추출 함수 ---
def extract_emotion_from_query(query: str) -> Optional[str]:
    """
    쿼리에서 감정 키워드 추출
    """
    if '긍정' in query:
        return '긍정'
    elif '부정' in query:
        return '부정'
    elif '중립' in query:
        return '중립'
    elif '감정' in query:
        return None
    else:
        return None

# --- 그래프 유형 추출 함수 ---
def extract_graph_type(query: str) -> str:
    """
    쿼리에서 그래프 유형 추출

    Returns:
        str: "pie", "bar", "line" 중 하나
    """
    if any(word in query for word in ["비율", "파이", "원형"]):
        return "pie"
    elif any(word in query for word in ["막대", "시간별", "시간대별", "그래프"]):
        # "그래프" 키워드가 있으면 bar로 처리(혹은 pie로 처리해도 무방)
        return "bar"
    elif any(word in query for word in ["선", "추세", "변화", "날짜별", "매일"]):
        return "line"

    # 기본값
    if "감정" in query:
        return "pie"
    elif "시간" in query:
        return "bar"
    elif "날짜" in query or "일별" in query:
        return "line"

    return "pie"


# --- 그래프 생성 함수 ---
def generate_graph_data(data: List[Any], query_text: str) -> Dict[str, Any]:
    """
    데이터를 기반으로 그래프 데이터 생성

    Args:
        data: 그래프로 표현할 데이터 (리스트의 딕셔너리 또는 리스트의 리스트)
        query_text: 원본 쿼리 텍스트

    Returns:
        Dict: Plotly 그래프 데이터
    """
    if not data:
        return {"error": "데이터가 없습니다."}

    print("DEBUG: generate_graph_data called")
    print("DEBUG: data =", data)
    print("DEBUG: query_text =", query_text)
    graph_type = extract_graph_type(query_text)
    print("DEBUG: graph_type =", graph_type)

    # 0. 리스트의 리스트(2차원 배열)도 자동 그래프 변환
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], (list, tuple)):
        # 예: [["긍정", 3], ["부정", 2]]
        labels = [row[0] for row in data if len(row) >= 2]
        values = [row[1] for row in data if len(row) >= 2]
        chart_type = "pie" if graph_type == "pie" else "bar"
        if chart_type == "pie":
            return {
                "type": "pie",
                "data": {
                    "labels": labels,
                    "values": values
                },
                "layout": {
                    "title": "비율 그래프"
                }
            }
        else:
            return {
                "type": "bar",
                "data": {
                    "x": labels,
                    "y": values
                },
                "layout": {
                    "title": "집계 그래프",
                    "xaxis": {"title": "항목"},
                    "yaxis": {"title": "값"}
                }
            }

    # 1. 일반 집계 데이터(라벨+값 쌍) 자동 그래프 생성
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
        possible_value_keys = ["count", "total", "sum"]
        for item in data:
            value_key = next((k for k in item.keys() if k in possible_value_keys), None)
            if value_key:
                label_key = next((k for k in item.keys() if k != value_key), None)
                if label_key:
                    labels = [str(d[label_key]) for d in data]
                    values = [d[value_key] for d in data]
                    chart_type = "pie" if graph_type == "pie" else "bar"
                    if chart_type == "pie":
                        return {
                            "type": "pie",
                            "data": {
                                "labels": labels,
                                "values": values
                            },
                            "layout": {
                                "title": f"{label_key}별 {value_key} 비율"
                            }
                        }
                    else:
                        return {
                            "type": "bar",
                            "data": {
                                "x": labels,
                                "y": values
                            },
                            "layout": {
                                "title": f"{label_key}별 {value_key} 집계",
                                "xaxis": {"title": label_key},
                                "yaxis": {"title": value_key}
                            }
                        }

    # 2. 시간별 대화량 (예시)
    if graph_type == "bar":
        hour_data = {}
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and "usage_stats" in item:
                    for stat in item.get("usage_stats", []):
                        if isinstance(stat, dict) and "hour" in stat and "count" in stat:
                            hour = stat.get("hour")
                            count = stat.get("count", 0)
                            hour_data[hour] = hour_data.get(hour, 0) + count

        if hour_data:
            sorted_hours = sorted(hour_data.items())
            return {
                "type": "bar",
                "data": {
                    "x": [item[0] for item in sorted_hours],
                    "y": [item[1] for item in sorted_hours]
                },
                "layout": {
                    "title": "시간별 대화량",
                    "xaxis": {"title": "시간"},
                    "yaxis": {"title": "대화 수"}
                }
            }

    # 3. 날짜별 대화량 (예시)
    if graph_type == "line":
        date_data = {}
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and "usage_stats" in item:
                    for stat in item.get("usage_stats", []):
                        if isinstance(stat, dict) and "date" in stat and "count" in stat:
                            date = stat.get("date")
                            count = stat.get("count", 0)
                            date_data[date] = date_data.get(date, 0) + count
                        elif isinstance(stat, dict) and "day_of_week" in stat and "count" in stat:
                            day = stat.get("day_of_week")
                            count = stat.get("count", 0)
                            date_data[day] = date_data.get(day, 0) + count

        if date_data:
            if all(isinstance(k, str) and len(k) > 3 for k in date_data.keys()):
                sorted_dates = sorted(date_data.items())
            else:
                day_order = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
                sorted_dates = [(day, date_data.get(day, 0)) for day in day_order if day in date_data]

            return {
                "type": "line",
                "data": {
                    "x": [item[0] for item in sorted_dates],
                    "y": [item[1] for item in sorted_dates]
                },
                "layout": {
                    "title": "날짜별 대화량",
                    "xaxis": {"title": "날짜"},
                    "yaxis": {"title": "대화 수"}
                }
            }

    # 4. 감정별 비율 (예전 로직, 필요시 유지)
    emotion_keywords = ["감정", "긍정", "부정", "중립", "비율", "그래프", "분포"]
    if graph_type in ["pie", "bar"] and any(kw in query_text for kw in emotion_keywords):
        emotion_counts = {}
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    if "stats" in item:
                        for stat in item.get("stats", []):
                            if isinstance(stat, dict) and "emotion" in stat and "count" in stat:
                                emotion = stat.get("emotion")
                                count = stat.get("count", 0)
                                if emotion:
                                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + count
                    elif "emotion" in item:
                        emotion = item.get("emotion")
                        if emotion:
                            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                    elif "analysis_rows" in item:
                        for row in item.get("analysis_rows", []):
                            if isinstance(row, dict) and "emotion" in row:
                                emotion = row.get("emotion")
                                if emotion:
                                    emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

        filtered_emotions = {k: v for k, v in emotion_counts.items() if v > 0}
        if filtered_emotions:
            chart_type = "pie" if graph_type == "pie" else "bar"
            if chart_type == "pie":
                return {
                    "type": "pie",
                    "data": {
                        "labels": list(filtered_emotions.keys()),
                        "values": list(filtered_emotions.values())
                    },
                    "layout": {
                        "title": "감정 비율"
                    }
                }
            else:
                return {
                    "type": "bar",
                    "data": {
                        "x": list(filtered_emotions.keys()),
                        "y": list(filtered_emotions.values())
                    },
                    "layout": {
                        "title": "감정 비율",
                        "xaxis": {"title": "감정"},
                        "yaxis": {"title": "건수"}
                    }
                }

    # 기본 테이블 데이터 반환
    return {
        "type": "table",
        "data": data
    }

# --- 쿼리 실행 및 결과 처리 함수 ---
def clean_query_string(query: str) -> str:
    # 공백 및 개행, 특수문자 제거
    return re.sub(r'\s+', '', query)

def process_query_result(query_type: str, result: Dict[str, Any], admin_query: str) -> Dict[str, Any]:
    """
    쿼리 결과를 처리하고 포맷팅
    """
    print("DEBUG: process_query_result called, query_type =", query_type)
    if query_type == "nl2sql":
        sql_query = result.get("sql_query", "")
        sql_result = result.get("sql_result", [])
        columns = result.get("columns", [])

        # columns가 비어 있고, sql_result가 2차원 배열이면 자동으로 생성
        if not columns and isinstance(sql_result, list) and len(sql_result) > 0 and isinstance(sql_result[0], (list, tuple)):
            columns = ["emotion", "count"]

        # 집계 쿼리 여부
        is_aggregation = any(agg_func in sql_query.upper() for agg_func in 
                           ["COUNT(", "SUM(", "AVG(", "MIN(", "MAX(", "GROUP BY"])

        # admin_query 전처리(개행, 공백, 특수문자 제거)
        admin_query_clean = clean_query_string(admin_query)
        print("DEBUG: admin_query =", repr(admin_query))
        print("DEBUG: admin_query_clean =", repr(admin_query_clean))
        print("DEBUG: is_aggregation =", is_aggregation)
        print("DEBUG: '표' in admin_query_clean:", "표" in admin_query_clean)
        print("DEBUG: '그래프' in admin_query_clean:", "그래프" in admin_query_clean)

        # ★ "표와 그래프"가 모두 요청된 경우: 혼합 응답
        if is_aggregation and ("표" in admin_query_clean and "그래프" in admin_query_clean):
            print("DEBUG: '표와 그래프' 분기 진입!")
            graph_data = generate_graph_data(sql_result, admin_query)
            table_data = {
                "data": sql_result,
                "columns": columns
            }
            return {
                "type": "mixed",
                "graph_data": graph_data,
                "table_data": table_data,
                "raw_data": sql_result,
                "columns": columns,
                "answer": result.get("answer", "")
            }

        # 그래프만 요청
        elif is_aggregation and "그래프" in admin_query_clean:
            print("DEBUG: '그래프'만 분기 진입!")
            graph_data = generate_graph_data(sql_result, admin_query)
            return {
                "type": "graph",
                "sql_query": sql_query,
                "graph_data": graph_data,
                "raw_data": sql_result,
                "columns": columns,
                "answer": result.get("answer", "")
            }

        print("DEBUG: '표'만 or 기본 분기 진입!")
        return {
            "type": "table",
            "sql_query": sql_query,
            "data": sql_result,
            "columns": columns,
            "answer": result.get("answer", "")
        }

    elif query_type == "rag":
        return {
            "type": "analysis",
            "data": result,
            "admin_query": admin_query
        }
    elif query_type == "graph":
        graph_data = generate_graph_data(result, admin_query)
        return {
            "type": "graph",
            "graph_data": graph_data,
            "raw_data": result,
            "admin_query": admin_query
        }
    elif query_type == "mixed":
        # 표 요청 키워드
        table_keywords = ["표", "테이블", "리스트"]
        has_table_request = any(kw in admin_query for kw in table_keywords)

        # 표 데이터 (표 요청이 있을 때만)
        sql_data = None
        if has_table_request and isinstance(result, dict) and "sql_result" in result:
            sql_data = {
                "type": "table",
                "sql_query": result.get("sql_query", ""),
                "data": result.get("sql_result", []),
                "columns": result.get("columns", [])
            }
        # 그래프 데이터 (graph_results가 있으면만 생성)
        graph_data = None
        if "graph_results" in result and result["graph_results"] is not None:
            graph_data = generate_graph_data(result["graph_results"], admin_query)
        # 분석/요약 데이터
        rag_data = None
        if "rag_results" in result and result["rag_results"]:
            rag_data = result["rag_results"]
        return {
            "type": "mixed",
            "table_data": sql_data,
            "graph_data": graph_data,
            "rag_data": rag_data,
            "raw_data": result,
            "admin_query": admin_query
        }
    return {"error": "알 수 없는 쿼리 유형입니다."}

# --- 통합 쿼리 처리 함수 ---
async def process_admin_query(admin_query: str) -> Dict[str, Any]:
    """
    관리자 쿼리를 처리하는 통합 함수
    """
    print("DEBUG: process_admin_query admin_query =", repr(admin_query))

    # 1. 쿼리 유형 분류
    query_type = classify_query_type(admin_query)
    print("DEBUG: process_admin_query called, query_type =", query_type)
    
    # 2. 날짜 정보 추출
    date_info = extract_date_from_query(admin_query)
    start_date = date_info["start_date"]
    end_date = date_info["end_date"]
    print(f"Date range: {start_date} to {end_date}")
    
    # 3. 구독/고인 코드 추출
    code_pairs = extract_subscription_deceased_codes(admin_query)
    print(f"Code pairs: {code_pairs}")
    
    # 4. 감정 정보 추출
    emotion = extract_emotion_from_query(admin_query)
    print(f"Emotion: {emotion}")
    
    # 5. 쿼리 유형에 따른 처리
    if query_type == "nl2sql":
        result = run_nl2sql(admin_query)
        sql_query, sql_result, keyvalue, columns = extract_sqlresult_keyvalue(result)
        print("DEBUG: extract_sqlresult_keyvalue keyvalue =", keyvalue)
        if keyvalue is not None:
            response = process_query_result("nl2sql", {
                "sql_query": sql_query,
                "sql_result": keyvalue,
                "columns": columns,
                "answer": result.get("answer", "")
            }, admin_query)
            print("DEBUG: process_admin_query 최종 result =", response)
            return response
        else:
            print("DEBUG: process_admin_query 최종 result = SQL 결과를 처리할 수 없습니다.")
            return {"error": "SQL 결과를 처리할 수 없습니다."}

    elif query_type in ["rag", "graph"]:
        need_date_keywords = ["특정일", "특정 날짜", "오늘", "어제", "이번주", "지난주", "이번달", "지난달"]
        need_date = any(kw in admin_query for kw in need_date_keywords)
        if need_date and (not start_date or not end_date):
            print("DEBUG: process_admin_query 최종 result = 날짜 정보가 필요합니다.")
            return {"error": "날짜 정보가 필요합니다."}

        if query_type == "graph" and not need_date:
            result = run_nl2sql(admin_query)
            sql_query, sql_result, keyvalue, columns = extract_sqlresult_keyvalue(result)
            print("DEBUG: extract_sqlresult_keyvalue keyvalue =", keyvalue)
            response = process_query_result("nl2sql", {
                "sql_query": sql_query,
                "sql_result": keyvalue,
                "columns": columns,
                "answer": result.get("answer", "")
            }, admin_query)
            print("DEBUG: process_admin_query 최종 result =", response)
            return response

        if start_date and end_date:
            start_time = f"{start_date} 00:00:00"
            end_time = f"{end_date} 23:59:59"
        else:
            start_time = None
            end_time = None

        if not code_pairs and start_time and end_time and start_date == end_date:
            all_pairs = get_all_subscription_deceased_pairs(start_time, end_time)
            for sub_code, dec_code in all_pairs:
                code_pairs.append({
                    "subscription_code": sub_code,
                    "deceased_code": dec_code
                })

        if not code_pairs:
            code_pairs.append({
                "subscription_code": None,
                "deceased_code": None
            })

        all_results = []
        for pair in code_pairs:
            subscription_code = pair["subscription_code"]
            deceased_code = pair["deceased_code"]

            prompt_data = None
            if subscription_code is not None:
                try:
                    prompt_data = fetch_prompt_data(subscription_code)
                except ValueError:
                    prompt_data = {
                        "subscription_code": subscription_code,
                        "deceased_code": deceased_code,
                        "name": "알 수 없음"
                    }
            else:
                prompt_data = {
                    "subscription_code": None,
                    "deceased_code": None,
                    "name": "전체 데이터"
                }

            query_text = f"query: {admin_query}"
            user_embedding = embedding_model.encode(query_text, normalize_embeddings=True).tolist()

            analysis_result = analyze_conversation(
                deceased_code=deceased_code,
                subscription_code=subscription_code,
                embedding=user_embedding,
                emotion=emotion,
                start_time=start_time,
                end_time=end_time,
                calc_length=True,
                top_k=5
            )

            if query_type == "graph":
                all_results.append({
                    "subscription_code": subscription_code,
                    "deceased_code": deceased_code,
                    "stats": analysis_result.get("stats", []),
                    "usage_stats": analysis_result.get("usage_stats", [])
                })
                continue

            is_emotion_query = emotion is not None or "감정" in admin_query

            prompt = (
                f"[구독번호: {subscription_code}] 관리자 질문: {admin_query}\n\n"
                "아래는 의미 기반 유사 대화/분석 결과입니다:\n"
                + "\n".join([
                    f"{row['content']} (감정: {row.get('emotion','-')}, 길이: {row.get('content_length','-')})"
                    for row in analysis_result['rows']
                ])
            )

            if is_emotion_query and analysis_result.get("stats"):
                prompt += "\n\n추가 통계/감정 변화:\n" + str(analysis_result.get("stats"))

            prompt += "\n\n위 정보를 참고해서 분석 결과를 알려주세요."

            llm_response = call_llm(prompt)

            all_results.append({
                "subscription_code": subscription_code,
                "deceased_code": deceased_code,
                "admin_query": admin_query,
                "llm_response": llm_response,
                "analysis_rows": analysis_result['rows'],
                "stats": analysis_result.get("stats", []),
                "usage_stats": analysis_result.get("usage_stats", [])
            })

        response = process_query_result(query_type, all_results, admin_query)
        print("DEBUG: process_admin_query 최종 result =", response)
        return response

    elif query_type == "mixed":
        # 1. run_nl2sql로 표 데이터 추출
        sql_result = run_nl2sql(admin_query)
        sql_query, _, keyvalue, columns = extract_sqlresult_keyvalue(sql_result)
        print("DEBUG: extract_sqlresult_keyvalue keyvalue =", keyvalue)

        # 그래프 키워드 리스트
        graph_keywords = ["그래프", "차트", "시각화", "비율", "파이", "원형", "막대"]
        has_graph_request = any(kw in admin_query for kw in graph_keywords)

        # 2. 그래프 데이터 생성 (그래프 키워드가 있을 때만)
        graph_results = keyvalue if has_graph_request else None

        # 3. 분석(요약/AI) 결과 생성
        rag_results = []
        if keyvalue:
            table_text = "\n".join([", ".join([str(cell) for cell in row]) for row in keyvalue])
            prompt = (
                f"다음 표는 관리자 질문 '{admin_query}'에 대한 SQL 결과입니다.\n"
                f"표 데이터:\n{table_text}\n\n"
                "위 표를 참고하여 의미 있는 분석 또는 요약을 해주세요."
            )
            llm_response = call_llm(prompt)
            rag_results.append({
                "llm_response": llm_response,
                "table_data": keyvalue
            })

        response = process_query_result("mixed", {
            "sql_query": sql_query,
            "sql_result": keyvalue,
            "columns": columns,
            "answer": sql_result.get("answer", ""),
            "graph_results": graph_results,   # ★ 그래프 키워드가 있을 때만 포함
            "rag_results": rag_results
        }, admin_query)
        print("DEBUG: process_admin_query 최종 result =", response)
        return response

    print("DEBUG: process_admin_query 최종 result = 처리할 수 없는 쿼리입니다.")
    return {"error": "처리할 수 없는 쿼리입니다."}

# --- LLM 호출 함수 ---
openai_llm = ChatOpenAI(
    model="gpt-4.1-nano",
    temperature=0.5,
    verbose=True
)

def call_llm(prompt: str) -> str:
    response = openai_llm.invoke(prompt)
    return response.content if hasattr(response, "content") else str(response)

# --- FastAPI 입력 모델 ---
class AdminQueryRequest(BaseModel):
    admin_query: str

# --- 통합 엔드포인트 ---
@admin_router.post("/ai/admin/query")
async def admin_query_endpoint(payload: AdminQueryRequest):
    """
    모든 관리자 쿼리를 처리하는 통합 엔드포인트
    """
    try:
        result = await process_admin_query(payload.admin_query)
        return JSONResponse(content=jsonable_encoder(result))
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error processing query: {error_trace}")
        return JSONResponse(
            status_code=500,
            content=jsonable_encoder({"error": f"쿼리 처리 중 오류가 발생했습니다: {str(e)}"})
        )

# --- 기존 엔드포인트 유지 (하위 호환성) ---
@admin_router.post("/ai/admin/rag")
def ai_admin_endpoint(payload: AdminQueryRequest):
    admin_query = payload.admin_query
    emotion = extract_emotion_from_query(admin_query)
    query_tuples = extract_query_tuples(admin_query)
    result = admin_rag_advanced(
        query_tuples=query_tuples,
        admin_query=admin_query,
        emotion=emotion,
        calc_length=True,
        top_k=5
    )
    return JSONResponse(content=jsonable_encoder(result))

# --- 기존 함수 유지 (하위 호환성) ---
def extract_query_tuples(query: str):
    pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일[^.]*?subscription_code\s*=\s*(\d+),\s*deceased_code\s*=\s*(\d+)'
    matches = re.findall(pattern, query)
    
    result = []
    for year, month, day, sub_code, dec_code in matches:
        date_str = f"{year}-{int(month):02d}-{int(day):02d}"
        start_time = f"{date_str} 00:00:00"
        end_time = f"{date_str} 23:59:59"
        
        result.append({
            "subscription_code": int(sub_code),
            "deceased_code": int(dec_code),
            "start_time": start_time,
            "end_time": end_time
        })
    
    # 날짜만 있고 subscription_code, deceased_code가 없으면 구독/고인별 전체 분석
    if not result:
        match = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', query)
        if match:
            year, month, day = match.groups()
            date_str = f"{year}-{int(month):02d}-{int(day):02d}"
            start_time = f"{date_str} 00:00:00"
            end_time = f"{date_str} 23:59:59"
            
            all_pairs = get_all_subscription_deceased_pairs(start_time, end_time)
            if all_pairs:
                for sub_code, dec_code in all_pairs:
                    result.append({
                        "subscription_code": sub_code,
                        "deceased_code": dec_code,
                        "start_time": start_time,
                        "end_time": end_time
                    })
            else:
                # 없으면 전체 데이터 분석용도 추가
                result.append({
                    "subscription_code": None,
                    "deceased_code": None,
                    "start_time": start_time,
                    "end_time": end_time
                })
    
    return result

def admin_rag_advanced(
    query_tuples: List[dict],
    admin_query: str,
    emotion: Optional[str] = None,
    calc_length: bool = False,
    top_k: int = 5,
    similarity_threshold: float = 1.75
):
    all_results = []
    
    for tup in query_tuples:
        subscription_code = tup["subscription_code"]
        deceased_code = tup["deceased_code"]
        start_time = tup["start_time"]
        end_time = tup["end_time"]
        
        # subscription_code가 None이면 전체 데이터 분석이므로 fetch_prompt_data 건너뜀
        if subscription_code is not None:
            try:
                prompt_data = fetch_prompt_data(subscription_code)
            except ValueError:
                prompt_data = {
                    "subscription_code": subscription_code,
                    "deceased_code": deceased_code,
                    "name": "알 수 없음"
                }
        else:
            prompt_data = {
                "subscription_code": None,
                "deceased_code": None,
                "name": "전체 데이터"
            }
        
        query_text = f"query: {admin_query}"
        user_embedding = embedding_model.encode(query_text, normalize_embeddings=True).tolist()
        
        analysis_result = analyze_conversation(
            deceased_code=deceased_code,
            subscription_code=subscription_code,
            embedding=user_embedding,
            emotion=emotion,
            start_time=start_time,
            end_time=end_time,
            calc_length=calc_length,
            top_k=top_k,
            similarity_threshold=similarity_threshold
        )
        
        is_emotion_query = emotion is not None or "감정" in admin_query
        
        prompt = (
            f"[구독번호: {subscription_code}] 관리자 질문: {admin_query}\n\n"
            "아래는 의미 기반 유사 대화/분석 결과입니다:\n"
            + "\n".join([
                f"{row['content']} (감정: {row.get('emotion','-')}, 길이: {row.get('content_length','-')})"
                for row in analysis_result['rows']
            ])
        )
        
        if is_emotion_query and analysis_result.get("stats"):
            prompt += "\n\n추가 통계/감정 변화:\n" + str(analysis_result.get("stats"))
        
        prompt += "\n\n위 정보를 참고해서 분석 결과를 알려주세요."
        
        llm_response = call_llm(prompt)
        
        all_results.append({
            "subscription_code": subscription_code,
            "deceased_code": deceased_code,
            "admin_query": admin_query,
            "llm_response": llm_response,
            "analysis_rows": analysis_result['rows'],
            "stats": analysis_result.get("stats", []),
            "usage_stats": analysis_result.get("usage_stats", []),
            "is_emotion_query": is_emotion_query
        })
    
    return all_results

# --- 기존 nl2sql 엔드포인트 유지 ---
class NLQueryRequest(BaseModel):
    natural_language_query: str

@admin_router.post("/ai/admin/nl2sql")
async def nl2sql_endpoint(request: NLQueryRequest):
    query = request.natural_language_query
    result = run_nl2sql(query)
    sql_query, sql_result, keyvalue, columns = extract_sqlresult_keyvalue(result)
    print("DEBUG: extract_sqlresult_keyvalue keyvalue =", keyvalue)
    
    if keyvalue is not None:
        return JSONResponse(content=jsonable_encoder({
            "sql_query": sql_query,
            "sql_result": keyvalue,
            "columns": columns,
            "answer": result.get("answer")
        }))
    return JSONResponse(content=jsonable_encoder({"error": "SQLResult not found"}), status_code=500)

# --- 기존 nl2rag 엔드포인트 유지 ---
class NL2RAGRequest(BaseModel):
    nl_query: str
    summary_query: str
    date: str

def extract_aliases(select_fields):
    # SELECT절에서 alias만 추출 (AS "한글명" 또는 AS '한글명')
    pattern = r'AS\s+["\']?([\w가-힣\s]+)["\']?'
    return re.findall(pattern, select_fields)

@admin_router.post("/ai/admin/nl2rag")
def nl2rag_endpoint(payload: NL2RAGRequest):
    sql_out = run_nl2sql(payload.nl_query)
    steps = sql_out.get("intermediate_steps", [])
    sql_result = None
    for step in steps:
        if isinstance(step, str) and step.strip().startswith("[("):
            sql_result = step
            break
    if sql_result is None:
        return JSONResponse(status_code=500, content=jsonable_encoder({"error": "No SQL result found"}))
    try:
        sql_result = ast.literal_eval(sql_result)
    except Exception:
        return JSONResponse(status_code=500, content=jsonable_encoder({"error": "SQLResult eval failed"}))
    sql_query = None
    for step in steps:
        if isinstance(step, str) and "SQLQuery:" in step:
            sql_query = step
            break
    if sql_query is None:
        return JSONResponse(status_code=500, content=jsonable_encoder({"error": "No SQLQuery found"}))
    select_match = re.search(r"SELECT\s+(.*?)\s+FROM", sql_query, re.IGNORECASE | re.DOTALL)
    if not select_match:
        return JSONResponse(status_code=500, content=jsonable_encoder({"error": "SELECT clause not found"}))
    columns = [
        c.strip().split(" AS ")[-1].replace('"', '').replace("'", "")
        for c in select_match.group(1).split(",")
    ]
    dict_rows = [dict(zip(columns, row)) for row in sql_result]
    if not dict_rows or not ("subscription_code" in dict_rows[0] and "deceased_code" in dict_rows[0]):
        return JSONResponse(content=jsonable_encoder(dict_rows))
    results = []
    for row in dict_rows:
        subscription_code = row.get("subscription_code")
        deceased_code = row.get("deceased_code")
        if not (subscription_code and deceased_code):
            continue
        embedding = embedding_model.encode(payload.summary_query, normalize_embeddings=True).tolist()
        start_time = f"{payload.date} 00:00:00"
        end_time = f"{payload.date} 23:59:59"
        analysis = analyze_conversation(
            subscription_code=subscription_code,
            deceased_code=deceased_code,
            embedding=embedding,
            start_time=start_time,
            end_time=end_time,
            calc_length=True
        )
        results.append({
            "subscription_code": subscription_code,
            "deceased_code": deceased_code,
            "analysis": analysis
        })
    return JSONResponse(content=jsonable_encoder(results))

# --- 기존 함수 유지 ---
def extract_sqlresult_keyvalue(result):
    steps = result.get("intermediate_steps", [])
    sql_query = None
    sql_result = None
    columns = None

    # 1. 쿼리문 추출
    for step in steps:
        if isinstance(step, dict) and "sql_cmd" in step:
            sql_query = step["sql_cmd"].strip()
            break
        if isinstance(step, str) and step.strip().lower().startswith("select"):
            sql_query = step.strip()
            break
        if isinstance(step, str) and "SQLQuery:" in step:
            sql_query = step.split("SQLQuery:", 1)[1].strip()
            break

    # 2. 쿼리 결과 추출
    for step in steps:
        if isinstance(step, str) and step.strip().startswith("[("):
            sql_result = step.strip()
            break
        if isinstance(step, (list, tuple)):
            sql_result = step
            break
        if isinstance(step, str) and "SQLResult:" in step:
            result_part = step.split("SQLResult:", 1)[1].strip()
            if result_part.startswith("[(") or result_part.startswith("[{"):
                sql_result = result_part
                break

    # 3. 컬럼명 추출
    if sql_query:
        select_match = re.search(r"SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)", sql_query, re.IGNORECASE | re.DOTALL)
        if select_match:
            select_fields = select_match.group(1).strip()
            table_name = select_match.group(2).strip()

            if select_fields == "*":
                columns = get_table_columns(table_name)
            else:
                columns = extract_aliases(select_fields)

    # 4. 쿼리 결과 파싱
    keyvalue = None
    if sql_result is not None:
        if isinstance(sql_result, str):
            try:
                # 1. datetime.datetime(YYYY, MM, DD, hh, mm, ss, ms) → 'YYYY-MM-DD HH:MM:SS'
                def dt_repl(m):
                    y, mo, d, h, mi, s, *rest = m.groups()
                    # ms = rest[0] if rest else "0"
                    return f"'{int(y):04d}-{int(mo):02d}-{int(d):02d} {int(h):02d}:{int(mi):02d}:{int(s):02d}'"
                sql_result_str = re.sub(
                    r"datetime\.datetime\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+)?\)",
                    dt_repl,
                    sql_result
                )
                # 2. datetime.date(YYYY, MM, DD) → 'YYYY-MM-DD'
                sql_result_str = re.sub(
                    r"datetime\.date\((\d+),\s*(\d+),\s*(\d+)\)",
                    lambda m: f"'{int(m.group(1)):04d}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'",
                    sql_result_str
                )
                keyvalue = ast.literal_eval(sql_result_str)
            except Exception as e:
                print("[DEBUG][extract_sqlresult_keyvalue] ast.literal_eval error:", e)
                keyvalue = None
        elif isinstance(sql_result, (list, tuple)):
            keyvalue = sql_result

    return sql_query, sql_result, keyvalue, columns

def get_table_columns(table_name):
    # db._engine은 SQLAlchemy 엔진
    from sqlalchemy import inspect
    from llm.services.sql_chain_util import db
    
    inspector = inspect(db._engine)
    return [col["name"] for col in inspector.get_columns(table_name)]

def safe_eval_with_datetime(sql_result):
    # datetime.datetime(2025, 4, 23, 15, 15, 25, 639622) → "2025-04-23 15:15:25"
    def dt_repl(match):
        dt_args = match.group(1).split(",")
        dt_args = [a.strip() for a in dt_args]
        
        # 최소 3개(년, 월, 일) 필요
        if len(dt_args) >= 3:
            y, m, d = map(int, dt_args[:3])
            h = int(dt_args[3]) if len(dt_args) > 3 else 0
            mi = int(dt_args[4]) if len(dt_args) > 4 else 0
            s = int(dt_args[5]) if len(dt_args) > 5 else 0
            # 마이크로초는 무시
            return f'"{y:04d}-{m:02d}-{d:02d} {h:02d}:{mi:02d}:{s:02d}"'
        
        return '"INVALID_DATETIME"'
    
    # datetime.datetime(...) → "YYYY-MM-DD HH:MM:SS"로 치환
    patched = re.sub(r"datetime\.datetime\((.*?)\)", dt_repl, sql_result)
    
    return ast.literal_eval(patched)
