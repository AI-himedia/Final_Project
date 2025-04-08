from db.db_postgresql import get_db_connection


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
        "user_name": row[0],
        "user_nickname": row[1],
        "relationship": row[2],
        "deceased_name": row[3],
        "deceased_age": row[4],
        "personality": row[5],
        "deceased_nickname": row[6],
        "tone_style": row[8],
        "common_phrases": row[9],
        "example_lines": row[10]
    }
