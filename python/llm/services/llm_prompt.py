import json
from typing import List, Optional
from llm.models.request_models import DeceasedData, DeceasedHint

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
                "image_url": {"url": f"data:{img['mime']};base64,{img['base64']}",
                              "detail": "low"
                              }
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


def build_analysis_messages_with_presigned_urls(
        combined_text: str, 
        presignedUrls: List[str],
        deceased_hint: DeceasedHint,
        deceased_data: DeceasedData,
    ) -> List[dict]:
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
    if presignedUrls:
        content_list += [
            {
                "type": "image_url",
                "image_url": {
                    "url": url,
                    "detail": "low"
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

def build_analysis_messages_incrementally(
        previous_result: Optional[dict],
        text: str,
        image_urls: List[str],
        deceased_hint: DeceasedHint,
    ) -> List[dict]:

    user_content = []

    # 1. 텍스트 대화 추가
    if text.strip():
        user_content.append({
            "type": "text",
            "text": f"[{deceased_hint.nickname or '고인'}와의 대화]\n{text.strip()}"
        })

    # 2. 이미지 대화 캡처 추가 + 화자 위치 안내
    if image_urls:
        for img_url in image_urls:
            bubble_side = deceased_hint.smsBubbleSide or "왼쪽 또는 오른쪽 (명확하지 않음)"
            user_content.append({
                "type": "text",
                "text": f"[참고: 고인은 문자 캡처에서 **{bubble_side} 말풍선**입니다.]"
            })
            user_content.append({
                "type": "image_url",
                "image_url": {"url": img_url, "detail": "low"}
            })

    # 3. 시스템 메시지 구성
    system_text = (
        "당신은 언어 분석 전문가입니다. 아래 대화 자료는 실제 카카오톡 대화 또는 대화록 캡쳐본 입니다.\n"
        "이 인물은 이미 세상을 떠났고, AI 아바타를 위한 언어 프로필을 만드는 중입니다.\n\n"
        "주어진 자료를 바탕으로 고인의 말투, 언어 습관, 감정 표현, 자주 사용하는 말 등을 분석하세요.\n"
        "이전 분석 결과가 있다면 그것을 보완하거나 업데이트하세요.\n\n"
        "분석 결과는 아래 JSON 형식으로 작성하고, 반드시 **한글**로 답변하세요.\n" 
        "모든 값은 문자열로 작성해주세요. 다음 형식을 그대로 따르세요:\n\n"
        
        "{\n"
        "  \"tone_style\": \"\",\n"
        "  \"common_phrases\": [\"\", \"\"],\n"
        "  \"example_lines\": [\"\", \"\"]\n"
        "}\n\n"
        "위 JSON 외에 다른 문장, 해설, 설명 텍스트는 포함하지 마세요."
    )
    
    # 4. 이전 분석 결과가 있다면 system prompt에 추가
    if previous_result:
        system_text += f"\n[이전 분석 결과 참고]:\n"
        system_text += json.dumps(previous_result, ensure_ascii=False, indent=2)

    return [
        {"role": "system", "content": system_text},
        {"role": "user", "content": user_content}
    ]
