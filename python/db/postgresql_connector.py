from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.chat_history import BaseChatMessageHistory
from contextlib import contextmanager
from pgvector.psycopg2 import register_vector
import os
import psycopg2

# .env 파일에서 환경변수 로드
load_dotenv()

# db 연결 함수
@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    register_vector(conn)
    try:
        yield conn
    finally:
        conn.close()

