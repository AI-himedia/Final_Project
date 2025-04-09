from db.postgresql_connector import get_db_connection
from typing import List, Literal, Tuple
from psycopg2.extras import execute_values
from datetime import datetime


def fetch_prompt_data(subscription_code: int) -> dict:

    with get_db_connection as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    s.deceased_code,
                    u.full_name AS user_name,
                    dd.user_nickname,
                    dd.relationship,
                    dd.deceased_name,
                    dd.deceased_age,
                    dd.personality,
                    dd.deceased_nickname,
                    dd.speaking_tone,
                    dd.tone_style,
                    dd.common_phrases,
                    dd.example_lines
                FROM subscription s
                JOIN users u ON u.code = s.user_code
                JOIN deceased_data dd ON dd.deceased_code = s.deceased_code
                WHERE s.subscription_code = %s
            """, (subscription_code,))
            row = cur.fetchone()

    if not row:
        raise ValueError("subscription_code에 해당하는 데이터가 없습니다.")

    return {
        "deceased_code": row[0],
        "user_name": row[1],
        "user_nickname": row[2],
        "relationship": row[3],
        "deceased_name": row[4],
        "deceased_age": row[5],
        "personality": row[6],
        "deceased_nickname": row[7],
        "tone_style": row[9],
        "common_phrases": row[10],
        "example_lines": row[11]
    }



def add_messages(
    subscription_code: int,
    deceased_code: int,
    messages: List[Tuple[Literal["user", "ai"], str]],
    service_type: str = "sms"
) -> None:
    """
    여러 메시지를 bulk insert 하기 위한 함수

    :param subscription_code: 구독 코드
    :param deceased_code: 고인 코드
    :param messages: (role, content) 튜플의 리스트
    :param service_type: 기본 'sms'로 설정됨
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            query = """
                INSERT INTO contents (
                    subscription_code, deceased_code, service_type, role, message_time, content
                ) VALUES %s
            """

            # NOW()를 SQL 내부에서 쓰는 대신, Python에서 datetime.now()로 타임스탬프
            # 이 방식이 bulk insert 시 더 안정적이고, timezone 제어도 가능
            now = datetime.now()

            values = [
                (subscription_code, deceased_code, service_type, role, now, content)
                for role, content in messages
            ]

            execute_values(
                cur, query.replace("VALUES %s", "VALUES %s"),
                values
            )

            conn.commit()

