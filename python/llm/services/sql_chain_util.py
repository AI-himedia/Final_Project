from langchain_experimental.sql import SQLDatabaseChain
from langchain.prompts import PromptTemplate
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from sqlalchemy import create_engine, text
import os
import re

host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
dbname = os.getenv("DB_NAME")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")

DATABASE_URL = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"

_IMPROVED_TEMPLATE = """Given an input question, create a syntactically correct {dialect} query to run, then look at the results and return the answer.

Use the following format:
Question: "Question here"
SQLQuery: Write only the SQL query, do not surround it in quotes. "Do not write anything else after the SQL query."
SQLResult: "Result of the SQLQuery"
Answer: "Final answer here"

Only use the following tables:
{table_info}

Note:
- service 테이블의 PK는 code이며, service_code 컬럼은 없습니다.
- subscription 테이블의 PK는 subscription_code이며, code 컬럼은 없습니다.
- users 테이블의 이름 컬럼은 full_name입니다. name 컬럼은 없습니다.
- deceased_data의 PK는 deceased_code입니다.
- contents의 subscription_code, deceased_code는 각각 subscription/subscription_code, deceased_data/deceased_code를 참조합니다.
- FK 컬럼명과 PK 컬럼명이 다를 수 있으니 반드시 위 구조대로 사용하세요.
- vectorization 컬럼은 VECTOR(768) 타입으로, LangChain에서 인식하지 못할 수 있습니다.
- 모든 조인과 WHERE 조건에서 컬럼명을 위 구조대로 정확히 사용하세요.

추가 지시:
- 모든 SELECT 쿼리의 컬럼에는 반드시 한글 alias(AS "한글명")를 붙이세요.
  예: SELECT dd.deceased_name AS "고인 이름", c.content AS "내용", ...
- 쿼리 결과의 컬럼명은 반드시 한글 alias로만 나오도록 하세요.
- 표의 각 셀에는 반드시 문자열만 들어가게 하세요. 예를 들어 ["긍정", "매우 긍정"] 이런 배열은 "긍정, 매우 긍정"처럼 쉼표로 구분된 문자열로 변환해서 넣으세요.
- 표 셀에는 반드시 문자열만, 배열/객체는 쉼표로 join해서 넣으세요.
- 표를 생성할 때는 각 행의 값 개수와 컬럼명 개수가 반드시 일치하게 해줘.
- 예를 들어, 감정별 건수 표를 만들 때는 columns에 ["감정", "건수"]처럼 실제 데이터와 맞는 컬럼명을 모두 포함해줘.
- 여러 집계 결과(총 건수, 감정별 건수 등)는 각각 별도의 표로 만들어주거나, 하나의 표로 합칠 때도 columns와 data의 개수가 일치하게 해줘.
- 아래는 각 테이블 컬럼의 한글 alias 예시입니다:

users (
code -- 유저 코드
oauth -- 가입 형태
email -- 이메일
gender -- 성별
full_name -- 이름
number -- 전화번호
admin -- 관리자 여부
create_date -- 생성 날짜
status -- 탈퇴 여부
)

service (
code -- 서비스 코드
service_name -- 서비스 이름
)

deceased_data (
deceased_code -- 고인 코드
deceased_name -- 고인 이름
gender -- 고인 성별
deceased_age -- 고인 나이
personality -- 고인 특성
deceased_nickname -- 사용자가 고인을 부르는 호칭
user_nickname -- 고인이 사용자를 부르는 호칭
relationship -- 고인과의 관계
speaking_tone -- 반말 여부
)

subscription (
subscription_code -- 구독 코드
user_code -- 유저 코드
service_code -- 서비스 코드
deceased_code -- 고인 코드
start_date -- 구독 시작 날짜
end_date -- 구독 종료 날짜
cancel_date -- 구독 취소 신청 날짜
)

contents (
code -- 컨텐츠 코드
deceased_code -- 고인 코드
subscription_code -- 구독 코드
service_type -- 서비스 타입
role -- 역할
message_time -- 입력 일자
content -- 내용
emotion -- 감정
)

raw_file (
code -- 초기 데이터 파일 코드
subscription_code -- 구독 코드
voice_id -- elevenLabs voice_id
update_date -- 파일 추가 날짜
)

users: code (PK), oauth, email, gender, full_name, number, admin, create_date, status, refresh_token
service: code (PK), service_name
subscription: subscription_code (PK), user_code (FK), service_code (FK), deceased_code (FK), start_date, end_date, cancel_date
deceased_data: deceased_code (PK), deceased_name, gender, deceased_age, personality, deceased_nickname, user_nickname, relationship, speaking_tone, tone_style, common_phrases, example_lines
contents: code (PK), deceased_code (FK), subscription_code (FK), service_type, role, message_time, content, vectorization, model_version
raw_file: code (PK), subscription_code (FK), audio_file_paths, embedding, voice_id, sms_file_paths, update_date

For date queries:
- For specific day: WHERE message_time BETWEEN '2025-04-23 00:00:00' AND '2025-04-23 23:59:59'
- For specific month: WHERE message_time BETWEEN '2025-04-01 00:00:00' AND '2025-04-30 23:59:59'
- For date extraction: EXTRACT(YEAR FROM message_time), EXTRACT(MONTH FROM message_time)
- For date range aggregation: GROUP BY DATE(message_time)

For complex joins:
- To find conversations with specific deceased relationship: JOIN deceased_data ON contents.deceased_code = deceased_data.deceased_code WHERE deceased_data.relationship = '할머니'
- To find user's subscriptions: JOIN users ON subscription.user_code = users.code WHERE users.full_name = '김현진'
- To find service details: JOIN service ON subscription.service_code = service.code WHERE service.service_name = 'sms'

For emotion analysis:
- To filter by emotion: WHERE contents.emotion = '긍정'
- To count emotions: SELECT emotion, COUNT(*) FROM contents GROUP BY emotion

For aggregations:
- To find top users: SELECT users.full_name, COUNT(*) FROM contents JOIN subscription ON contents.subscription_code = subscription.subscription_code JOIN users ON subscription.user_code = users.code GROUP BY users.full_name ORDER BY COUNT(*) DESC LIMIT 3
- To aggregate by date: SELECT DATE(message_time) as date, COUNT(*) FROM contents GROUP BY DATE(message_time)

Question: {input}"""

PROMPT = PromptTemplate(
    input_variables=["input", "table_info", "dialect"],
    template=_IMPROVED_TEMPLATE
)

db = SQLDatabase.from_uri(DATABASE_URL)

llm = ChatOpenAI(temperature=0, model_name="gpt-4.1-nano")

sql_chain = SQLDatabaseChain.from_llm(
    llm,
    db,
    prompt=PROMPT,
    verbose=True,
    return_intermediate_steps=True
)

def clean_sql_query(sql_query: str) -> str:
    """
    'Answer:' 또는 'ANSWER:' 또는 '--' 등 이후 텍스트 제거
    """
    # 1. 'Answer:' 또는 'ANSWER:' 이후 텍스트 제거 (대소문자 모두)
    for marker in ['ANSWER:', 'Answer:']:
        if marker in sql_query:
            sql_query = sql_query.split(marker)[0]
    # 2. '--'로 시작하는 줄 이후 모두 제거 (주석 등)
    lines = []
    for line in sql_query.splitlines():
        if line.strip().startswith('--'):
            break
        lines.append(line)
    return '\n'.join(lines).strip()

def run_nl2sql(query: str):
    """
    자연어 쿼리를 SQL로 변환하고 실행하는 함수
    
    Args:
        query: 자연어 쿼리 문자열
        
    Returns:
        dict: 쿼리 결과와 중간 단계 정보를 포함한 딕셔너리
    """
    print("run_nl2sql - 입력 query:", query)
    
    # 날짜 형식 전처리 (2025년 4월 23일 → 2025-04-23)
    date_pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일'
    
    def date_replacer(match):
        year, month, day = match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
    
    preprocessed_query = re.sub(date_pattern, date_replacer, query)
    
    # 날짜 범위 전처리 (2025년 4월 21일부터 4월 23일까지)
    range_pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(?:부터|~)\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일\s*까지'
    
    def range_replacer(match):
        start_year, start_month, start_day = match.group(1), match.group(2), match.group(3)
        end_year = match.group(4) if match.group(4) else start_year
        end_month, end_day = match.group(5), match.group(6)
        
        start_date = f"{start_year}-{int(start_month):02d}-{int(start_day):02d}"
        end_date = f"{end_year}-{int(end_month):02d}-{int(end_day):02d}"
        
        return f"between '{start_date}' and '{end_date}'"
    
    preprocessed_query = re.sub(range_pattern, range_replacer, preprocessed_query)
    
    # 월 단위 전처리 (2025년 4월)
    month_pattern = r'(\d{4})년\s*(\d{1,2})월'
    
    def month_replacer(match):
        year, month = match.group(1), match.group(2)
        year_int, month_int = int(year), int(month)
        
        import calendar
        last_day = calendar.monthrange(year_int, month_int)[1]
        
        start_date = f"{year}-{month_int:02d}-01"
        end_date = f"{year}-{month_int:02d}-{last_day:02d}"
        
        return f"between '{start_date}' and '{end_date}'"
    
    preprocessed_query = re.sub(month_pattern, month_replacer, preprocessed_query)
    
    # 감정 키워드 전처리
    emotion_mapping = {
        "긍정적인": "긍정",
        "부정적인": "부정",
        "중립적인": "중립"
    }
    
    for key, value in emotion_mapping.items():
        preprocessed_query = preprocessed_query.replace(key, value)
    
    # 구독/고인 코드 전처리
    code_pattern = r'subscription_code\s*=\s*(\d+)[,\s]*deceased_code\s*=\s*(\d+)'
    
    def code_replacer(match):
        sub_code, dec_code = match.group(1), match.group(2)
        return f"subscription_code = {sub_code} AND deceased_code = {dec_code}"
    
    preprocessed_query = re.sub(code_pattern, code_replacer, preprocessed_query)
    
    result = sql_chain.invoke(preprocessed_query)
    print("run_nl2sql - result:", result)
    print("run_nl2sql - intermediate_steps:", result.get("intermediate_steps"))

    # --- SQL 쿼리 정제: 'ANSWER:' 이하 제거 및 직접 실행 ---
    sql_query = None
    if "intermediate_steps" in result:
        for step in result["intermediate_steps"]:
            if isinstance(step, str) and "SQLQuery:" in step:
                sql_query = step.split("SQLQuery:", 1)[1].strip()
                break

    if sql_query:
        cleaned_sql_query = clean_sql_query(sql_query)
        print("run_nl2sql - cleaned_sql_query:", cleaned_sql_query)

        # 실제 SQL 실행 (SQLAlchemy 사용)
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            try:
                sql_result = connection.execute(text(cleaned_sql_query)).fetchall()
                # 컬럼명 추출
                columns = list(sql_result[0].keys()) if sql_result else []
                result["sql_result"] = [tuple(row) for row in sql_result]
                result["columns"] = columns
            except Exception as e:
                print("[run_nl2sql] SQL 실행 오류:", e)
                result["sql_result"] = None
                result["columns"] = None

    return result