def build_prompt(chat_log: str) -> list:
    return [
        {"role": "system", "content": (
            "당신은 언어 분석가입니다. JSON 형식으로 분석 결과를 출력하세요...\n"
            "{\n  \"tone_style\": \"...\", ...\n}"
        )},
        {"role": "user", "content": f"[대화 시작]\n{chat_log}\n[대화 끝]"}
    ]
