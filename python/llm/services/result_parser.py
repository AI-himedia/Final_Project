import json
import re

def parse_response(text: str) -> dict:
    match = re.search(r'\{[\s\S]*\}', text)
    if not match:
        raise ValueError("JSON 블록을 찾을 수 없습니다.")
    return json.loads(match.group(0))
