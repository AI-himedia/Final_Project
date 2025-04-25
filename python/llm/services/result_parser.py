import json
import re

# LLM이 JSON 앞에 안내 문장을 붙이는 경우까지 고려
# Structured ouputs 로 대체 가능한지 추후에 알아보자
def parse_response(text: str) -> dict:
    try:
        match = re.search(r'\{[\s\S]*\}', text)
        if not match:
            raise ValueError("JSON 블록을 찾을 수 없습니다.")

        json_text = match.group(0)

        # JSON 유효성 검사
        parsed = json.loads(json_text)

        # 필수 키 검사 (선택)
        required_keys = ["tone_style", "common_phrases", "example_lines"]
        for key in required_keys:
            if key not in parsed:
                raise ValueError(f"'{key}' 필드가 응답에 없습니다.")

        return parsed
    
    except json.JSONDecodeError as e:
        print("JSON 파싱 에러:", e)
        raise ValueError("응답 형식이 잘못되어 파싱에 실패했습니다.")
