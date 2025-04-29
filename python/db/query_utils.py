from db.postgresql_connector import get_db_connection
from typing import List, Literal, Tuple, Optional
from psycopg2.extras import execute_values, Json, RealDictCursor
from datetime import datetime
from llm.models.request_models import DeceasedData

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
        "speaking_tone": "반말" if row[8] else "존댓말",
        "tone_style": row[9],
        "common_phrases": row[10],
        "example_lines": row[11]
    }

def get_similar_messages_with_embedding(
        deceased_code: int,
        embedding: List[float], 
        top_k: int = 5,
        similarity_threshold: float = 1.75
        ):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
            SELECT code, content, role, 
                1 - (vectorization <#> %s::vector) AS similarity
            FROM contents
            WHERE deceased_code = %s
                AND vectorization IS NOT NULL
                AND (1 - (vectorization <#> %s::vector)) >= %s 
            ORDER BY vectorization <#> %s::vector
            LIMIT %s;
            """
            cur.execute(query, (embedding, deceased_code, embedding, similarity_threshold, embedding, top_k))
            return cur.fetchall()


def get_vector():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                        SELECT content, vectorization 
                        FROM contents
                        ORDER BY code DESC
                        LIMIT 1
                    """)
            result = cur.fetchone()
            return result if result else None

            


# 문자응답시 input, output bulk INSERT
def add_messages(
    subscription_code: int,
    deceased_code: int,
    service_type: str,
    messages: List[Tuple[Literal["user", "ai"], str]],
    embeddings: Optional[List[Optional[List[float]]]] = None,
    model_version: Optional[str] = None
) -> None:
    """
    여러 메시지를 bulk insert 하기 위한 함수

    :param subscription_code: 구독 코드
    :param deceased_code: 고인 코드
    :param messages: (role, content) 튜플의 리스트
    :param embeddings: 각 메시지에 대한 임베딩 벡터 리스트 (user/ai 순서와 맞춰야 함)
    :param model_version: 벡터 생성에 사용한 임베딩 모델 버전
    :param service_type: 기본 'sms'로 설정됨
    """

    print(f"[DEBUG] add: {type(embeddings)}")


    with get_db_connection() as conn:
        with conn.cursor() as cur:
            query = """
                INSERT INTO contents (
                    subscription_code, 
                    deceased_code, 
                    service_type, 
                    role, 
                    message_time, 
                    content,
                    vectorization,
                    model_version
                ) VALUES %s
            """

            # NOW()를 SQL 내부에서 쓰는 대신, Python에서 datetime.now()로 타임스탬프
            # 이 방식이 bulk insert 시 더 안정적이고, timezone 제어도 가능
            now = datetime.now()

            values = []
            for i, (role, content) in enumerate(messages):
                embedding = embeddings[i] if embeddings else None
                print(f"[DEBUG] for: {type(embedding)}")
                values.append((
                    subscription_code,
                    deceased_code,
                    service_type,
                    role,
                    now,
                    content,
                    embedding,
                    model_version
                ))


            execute_values(
                cur, query.replace("VALUES %s", "VALUES %s"),
                values
            )

            conn.commit()


# 고인 정보 INSERT
def insert_deceased_data(deceased_data: DeceasedData) -> int:
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
                deceased_data.deceasedName,
                deceased_data.gender,
                deceased_data.deceasedAge,
                deceased_data.personality,
                deceased_data.deceasedNickname,
                deceased_data.userNickname,
                deceased_data.relationship,
                deceased_data.speakingTone,
                deceased_data.toneStyle,
                deceased_data.commonPhrases,
                deceased_data.exampleLines,
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
            return new_id


# 고인 정보 UPDATE
# tone_style, common_phrases, example_lines 는 required=false
def update_deceased_data(deceased_data: DeceasedData) -> None:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            fields = []
            values = []

            # 기본 필드
            field_map = {
                "deceasedName": "deceased_name",
                "gender": "gender",
                "deceasedAge": "deceased_age",
                "personality": "personality",
                "deceasedNickname": "deceased_nickname",
                "userNickname": "user_nickname",
                "relationship": "relationship",
                "speakingTone": "speaking_tone",
                # 선택적 필드
                "toneStyle": "tone_style",
                "commonPhrases": "common_phrases",
                "exampleLines": "example_lines"
            }

            for attr, column in field_map.items():
                value = getattr(deceased_data, attr)
                if value is not None:
                    fields.append(f"{column} = %s")
                    values.append(value)

            if not fields:
                print("업데이트할 필드가 없습니다.")
                return

            # 마지막 WHERE 조건에 deceasedCode 사용
            values.append(deceased_data.deceasedCode)
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

def insert_raw_file_and_voice_id(subscription_code: int, s3_url: str, voice_id: str):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO raw_file (subscription_code, audio_file_paths, voice_id)
                VALUES (%s, %s, %s)
            """, (subscription_code, s3_url, voice_id))
        conn.commit()

def voice_raw_file(conn, subscription_code: int, s3_url: str, embedding_data: dict, sms_paths: Optional[List[str]] = None):
    with conn.cursor() as cur:
        query = """
        INSERT INTO raw_file (subscription_code, audio_file_paths, embedding, sms_file_paths)
        VALUES (%s, %s, %s, %s)
        RETURNING Code;
        """
        try:
            cur.execute(query, (
                subscription_code,
                s3_url,
                Json(embedding_data),         # embedding 값을 JSONB로 저장
                sms_paths if sms_paths else None
            ))
            code = cur.fetchone()[0]
            conn.commit()
            return code
        except Exception as e:
            print("DB 저장 중 오류:", str(e))
            raise

def get_latest_embedding(conn, subscription_code: int):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT embedding
            FROM raw_file
            WHERE subscription_code = %s
            ORDER BY update_date DESC
            LIMIT 1
        """, (subscription_code,))
        result = cur.fetchone()
        return result[0] if result else None
    

def get_latest_voice_id(subscription_code: int):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT voice_id
                FROM raw_file
                WHERE subscription_code = %s
                ORDER BY update_date DESC
                LIMIT 1
            """, (subscription_code,))
            result = cur.fetchone()
            return result[0] if result else None
    

def save_results_to_postgres(results):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            for row in results:
                cur.execute("""
                    INSERT INTO test_logs (
                        model, test_name, user_input, expected, generated,
                        precision, recall, f1, toxicity, response_time
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    row["model"], row["test_name"], row["user_input"], row["expected"],
                    row["generated"], row["precision"], row["recall"],
                    row["f1"], row["toxicity"], row["response_time"]
                ))
            conn.commit()

def save_model_summary_to_postgres(results_dict: dict, test_batch: str):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            for model_name, result in results_dict.items():
                cur.execute("""
                    INSERT INTO model_test_summary (
                        model_name, avg_precision, avg_recall, avg_f1, toxicity_num
                        time_taken, avg_time_per_trial, test_batch
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    model_name,
                    result["avg_precision"],
                    result["avg_recall"],
                    result["avg_f1"],
                    result["toxicity_num"],
                    result["time_taken"],
                    result["avg_time_per_trial"],
                    test_batch
                ))
            conn.commit()
            
# rag_admin.py
def get_subscription_by_name(name: str):
    """
    사용자 이름으로 구독 정보를 조회하는 함수

    Args:
        name: 사용자 이름

    Returns:
        List[Dict]: 구독 정보 목록
    """
    query = """
    SELECT 
        s.subscription_code, 
        s.deceased_code 
    FROM 
        subscription s
    JOIN 
        users u ON s.user_code = u.code
    WHERE 
        u.full_name = %s
    """

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, (name,))
            results = cursor.fetchall()

            return [
                {"subscription_code": row[0], "deceased_code": row[1]}
                for row in results
            ]

def get_all_subscription_deceased_pairs(start_time: str, end_time: str):
    """
    특정 기간 동안 대화가 있는 모든 구독/고인 코드 쌍을 조회하는 함수

    Args:
        start_time: 시작 시간 (YYYY-MM-DD HH:MM:SS)
        end_time: 종료 시간 (YYYY-MM-DD HH:MM:SS)

    Returns:
        List[Tuple]: (subscription_code, deceased_code) 쌍의 목록
    """
    query = """
    SELECT DISTINCT 
        subscription_code, 
        deceased_code
    FROM 
        contents
    WHERE 
        message_time BETWEEN %s AND %s
    """
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, (start_time, end_time))
            results = cursor.fetchall()

            return results

def is_single_day(start_time, end_time):
    if start_time and end_time:
        return start_time[:10] == end_time[:10]
    return False

# --- 날짜만 있을 때 모든 쌍 조회 ---
def get_all_subscription_deceased_pairs(start_time, end_time):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT subscription_code, deceased_code
                FROM contents
                WHERE message_time BETWEEN %s AND %s
                AND subscription_code IS NOT NULL
                AND deceased_code IS NOT NULL
            """, (start_time, end_time))
            return cur.fetchall()  # [(sub_code, dec_code), ...]

def analyze_conversation(
    deceased_code: Optional[int] = None,
    subscription_code: Optional[int] = None,  # 단일값 또는 리스트 지원
    embedding: Optional[List[float]] = None,
    emotion: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    calc_length: bool = False,
    top_k: int = 5,
    similarity_threshold: float = 1.75
):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 1. SELECT절 동적 조립
            select_fields = ["code", "content", "role", "message_time", "emotion"]
            select_params = []
            if embedding is not None:
                select_fields.append("1 - (vectorization <#> %s::vector) AS similarity")
                select_params.append(embedding)
            if calc_length:
                select_fields.append("char_length(content) AS content_length")
            select_sql = ", ".join(select_fields)

            # 2. WHERE절 동적 조립
            where_clauses = []
            where_params = []
            if deceased_code is not None:
                where_clauses.append("deceased_code = %s")
                where_params.append(deceased_code)
            if subscription_code is not None:
                if isinstance(subscription_code, list):
                    where_clauses.append(f"subscription_code IN %s")
                    where_params.append(tuple(subscription_code))
                else:
                    where_clauses.append("subscription_code = %s")
                    where_params.append(subscription_code)
            if emotion is not None:
                where_clauses.append("emotion = %s")
                where_params.append(emotion)
            if start_time and end_time:
                where_clauses.append("message_time BETWEEN %s AND %s")
                where_params.extend([start_time, end_time])
            if embedding is not None:
                where_clauses.append("vectorization IS NOT NULL")
                where_clauses.append("(1 - (vectorization <#> %s::vector)) >= %s")
                where_params.append(embedding)
                where_params.append(similarity_threshold)
            where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            # 3. ORDER BY/ LIMIT
            order_by = ""
            order_params = []
            if embedding is not None:
                order_by = "ORDER BY vectorization <#> %s::vector"
                order_params.append(embedding)
            else:
                order_by = "ORDER BY message_time DESC"
            limit_sql = f"LIMIT {top_k}"

            # 4. 최종 쿼리
            query = f"""
                SELECT {select_sql}
                FROM contents
                {where_sql}
                {order_by}
                {limit_sql};
            """
            params = select_params + where_params + order_params

            cur.execute(query, params)
            rows = cur.fetchall()

            # 5. (선택) 감정 변화 등 추가 통계
            stats = []
            usage_stats = []

            if start_time and end_time:
                if is_single_day(start_time, end_time):
                    # 시간대별 감정 변화
                    stat_where = []
                    stat_params = []
                    if deceased_code is not None:
                        stat_where.append("deceased_code = %s")
                        stat_params.append(deceased_code)
                    if subscription_code is not None:
                        if isinstance(subscription_code, list):
                            stat_where.append("subscription_code IN %s")
                            stat_params.append(tuple(subscription_code))
                        else:
                            stat_where.append("subscription_code = %s")
                            stat_params.append(subscription_code)
                    stat_where.append("message_time BETWEEN %s AND %s")
                    stat_params.extend([start_time, end_time])
                    stat_where_sql = "WHERE " + " AND ".join(stat_where) if stat_where else ""

                    cur.execute(f"""
                        SELECT EXTRACT(HOUR FROM message_time) AS hour, emotion, COUNT(*) AS count
                        FROM contents
                        {stat_where_sql}
                        GROUP BY hour, emotion
                        ORDER BY hour
                    """, stat_params)
                    stats = cur.fetchall() or []

                    cur.execute(f"""
                        SELECT EXTRACT(HOUR FROM message_time) AS hour, COUNT(*) AS count
                        FROM contents
                        {stat_where_sql}
                        GROUP BY hour
                        ORDER BY hour
                    """, stat_params)
                    usage_stats = cur.fetchall() or []
                else:
                    # 요일별 감정 변화
                    stat_where = []
                    stat_params = []
                    if deceased_code is not None:
                        stat_where.append("deceased_code = %s")
                        stat_params.append(deceased_code)
                    if subscription_code is not None:
                        if isinstance(subscription_code, list):
                            stat_where.append("subscription_code IN %s")
                            stat_params.append(tuple(subscription_code))
                        else:
                            stat_where.append("subscription_code = %s")
                            stat_params.append(subscription_code)
                    stat_where.append("message_time BETWEEN %s AND %s")
                    stat_params.extend([start_time, end_time])
                    stat_where_sql = "WHERE " + " AND ".join(stat_where) if stat_where else ""

                    cur.execute(f"""
                        SELECT EXTRACT(DOW FROM message_time) AS day_of_week, emotion, COUNT(*) AS count
                        FROM contents
                        {stat_where_sql}
                        GROUP BY day_of_week, emotion
                        ORDER BY day_of_week
                    """, stat_params)
                    stats = cur.fetchall() or []

                    cur.execute(f"""
                        SELECT EXTRACT(DOW FROM message_time) AS day_of_week, COUNT(*) AS count
                        FROM contents
                        {stat_where_sql}
                        GROUP BY day_of_week
                        ORDER BY day_of_week
                    """, stat_params)
                    usage_stats = cur.fetchall() or []
            elif emotion is not None:
                stat_where = []
                stat_params = []
                if deceased_code is not None:
                    stat_where.append("deceased_code = %s")
                    stat_params.append(deceased_code)
                if subscription_code is not None:
                    if isinstance(subscription_code, list):
                        stat_where.append("subscription_code IN %s")
                        stat_params.append(tuple(subscription_code))
                    else:
                        stat_where.append("subscription_code = %s")
                        stat_params.append(subscription_code)
                stat_where.append("emotion = %s")
                stat_params.append(emotion)
                stat_where_sql = "WHERE " + " AND ".join(stat_where) if stat_where else ""

                cur.execute(f"""
                    SELECT EXTRACT(DOW FROM message_time) AS day_of_week, emotion, COUNT(*) AS count
                    FROM contents
                    {stat_where_sql}
                    GROUP BY day_of_week, emotion
                    ORDER BY day_of_week
                """, stat_params)
                stats = cur.fetchall() or []

                cur.execute(f"""
                    SELECT EXTRACT(DOW FROM message_time) AS day_of_week, COUNT(*) AS count
                    FROM contents
                    {stat_where_sql}
                    GROUP BY day_of_week
                    ORDER BY day_of_week
                """, stat_params)
                usage_stats = cur.fetchall() or []

            return {
                "rows": rows,
                "stats": stats,
                "usage_stats": usage_stats
            }
