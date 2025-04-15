from typing import List

def build_analysis_messages(combined_text: str, base64_images: List[str]) -> List[dict]:
    content_list = []

    # 텍스트가 있을 경우
    # 빈 문자열은 스킵
    if combined_text.strip():
        content_list.append({
            "type": "text", 
            "text": 
                (
                f"다음은 실제 대화 내용입니다:\n\n[대화 시작]\n{combined_text}\n[대화 끝]"
            )            
        })

    # 이미지가 있을 경우
    if base64_images:
        content_list += [
            {
                "type": "image_url",
                "image_url": {"url": f"data:{img['mime']};base64,{img['base64']}"}
            }
            for img in base64_images
        ]

    if not content_list:
        raise ValueError("분석할 텍스트 또는 이미지가 없습니다.")

    messages = [
        {
            "role": "system",
            "content": (
                "당신은 언어 분석 전문가입니다. 다음은 한 사람(진원)의 실제 카카오톡 대화 또는 대화록 캡쳐본 입니다.\n"
                "이 인물은 세상을 떠났으며, 그 사람의 말투, 언어 습관, 감정 표현, 자주 사용하는 말 등을 분석하여 "
                "AI 아바타로 구현하기 위한 정보를 추출해주세요.\n\n"
                "분석 결과는 다음 JSON 형식으로 한글로만 응답해주세요. 반드시 문자열 값으로 작성하세요:\n\n"
                "{\n"
                "  \"tone_style\": \"\",\n"
                "  \"common_phrases\": [\"\", \"\"],\n"
                "  \"example_lines\": [\"\", \"\"]\n"
                "}\n\n"
                "위 JSON 외에 다른 문장, 해설, 텍스트는 포함하지 마세요."
            )
        },
        {
            "role": "user",
            "content": content_list
        }
    ]

    return messages


def build_analysis_messages_with_presigned_urls(presignedUrls: List[str]) -> List[dict]:
    content_list = []

    if presignedUrls:
        content_list += [
            {
                "type": "image_url",
                "image_url": {
                    "url": url
                }
            }
            for url in presignedUrls
        ]

    messages = [
        {
            "role": "system",
            "content": (
                "당신은 언어 분석 전문가입니다. 다음은 한 사람(진원)의 실제 카카오톡 대화 또는 대화록 캡쳐본 입니다.\n"
                "이 인물은 세상을 떠났으며, 그 사람의 말투, 언어 습관, 감정 표현, 자주 사용하는 말 등을 분석하여 "
                "AI 아바타로 구현하기 위한 정보를 추출해주세요.\n\n"
                "분석 결과는 다음 JSON 형식으로 한글로만 응답해주세요. 반드시 문자열 값으로 작성하세요:\n\n"
                "{\n"
                "  \"tone_style\": \"\",\n"
                "  \"common_phrases\": [\"\", \"\"],\n"
                "  \"example_lines\": [\"\", \"\"]\n"
                "}\n\n"
                "위 JSON 외에 다른 문장, 해설, 텍스트는 포함하지 마세요."
            )
        },
        {
            "role": "user",
            "content": content_list
        }
    ]

    return messages