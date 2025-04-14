from db.postgresql_connector import get_db_connection
from typing import List, Literal, Tuple
from psycopg2.extras import execute_values
from datetime import datetime

# system_prompt_template에 필요한 data
def fetch_prompt_data(subscription_code: int) -> dict:

    with get_db_connection() as conn:
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


# 문자응답시 input, output bulk INSERT
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


# 고인 정보 INSERT
def insert_deceased_data(deceased_data: dict) -> int:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO deceased_data (
                    deceased_name, gender, deceased_age, personality,
                    deceased_nickname, user_nickname, relationship,
                    speaking_tone, tone_style, common_phrases, example_lines
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING deceased_code
            """, (
                deceased_data.get("deceased_name"),
                deceased_data.get("gender"),
                deceased_data.get("deceased_age"),
                deceased_data.get("personality"),
                deceased_data.get("deceased_nickname"),
                deceased_data.get("user_nickname"),
                deceased_data.get("relationship"),
                deceased_data.get("speaking_tone"),
                deceased_data.get("tone_style"),
                deceased_data.get("common_phrases"),
                deceased_data.get("example_lines"),
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
            return new_id


# 고인 정보 UPDATE
# tone_style, common_phrases, example_lines 는 required=false
def update_deceased_data(deceased_data: dict) -> None:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            fields = []
            values = []

            # 기본 필드
            field_map = {
                "deceased_name": "deceased_name",
                "gender": "gender",
                "deceased_age": "deceased_age",
                "personality": "personality",
                "deceased_nickname": "deceased_nickname",
                "user_nickname": "user_nickname",
                "relationship": "relationship",
                "speaking_tone": "speaking_tone",
                # 선택적 필드
                "tone_style": "tone_style",
                "common_phrases": "common_phrases",
                "example_lines": "example_lines"
            }

            for key, column in field_map.items():
                if key in deceased_data and deceased_data[key] is not None:
                    fields.append(f"{column} = %s")
                    values.append(deceased_data[key])

            if not fields:
                print("업데이트할 필드가 없습니다.")
                return

            # 마지막에 WHERE 조건 넣기
            values.append(deceased_data["deceased_code"])
            query = f"""
                UPDATE deceased_data
                SET {', '.join(fields)}
                WHERE deceased_code = %s
            """
            cur.execute(query, values)
            conn.commit()


# subscription 테이블 UPDATE
def update_subscription(subscription_code: int, deceased_code: int):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE subscription
                SET deceased_code = %s
                WHERE subscription_code = %s
            """, (deceased_code, subscription_code))
        conn.commit()


# raw_file 테이블 INSERT
def insert_raw_file(subscription_code: int, chat_urls: list[str]):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO raw_file (subscription_code, sms_file_paths)
                VALUES (%s, %s)
            """, (subscription_code, chat_urls))
        conn.commit()
