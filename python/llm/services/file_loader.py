from urllib.parse import urlparse
from typing import List, Tuple
import boto3
import base64

# S3 URL 파싱
# 내부에서 URL 파싱해서 bucket, key 분리 
def parse_s3_url(s3_url: str) -> Tuple[str, str]:
    parsed = urlparse(s3_url)
    # 버켓이름.s3.amazonaws.com → 버켓이름
    bucket = parsed.netloc.split('.')[0]  
    # /text/chat1.txt → text/chat1.txt
    key = parsed.path.lstrip('/')         
    return bucket, key

# 확장자 추출
def get_file_extension(url: str) -> str:
    return url.split('.')[-1].lower()

# 이미지 MIME 타입 추출
def get_mime_type(ext: str) -> str:
    return {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp"
    }.get(ext, "application/octet-stream")


# 내부적으로 .env, 시스템 환경변수, AWS config, IAM 역할을 자동으로 찾아서 인증함
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION 가 들어가 있어야함
# EC2/Lambda 환경이면 IAM Role 권한만 있어도 자동으로 인증
s3 = boto3.client("s3")


# 텍스트 파일 S3에서 boto3.get_object()로 텍스트 가져옴
def get_text_from_s3_url(http_url: str) -> str:
    bucket, key = parse_s3_url(http_url)
    response = s3.get_object(Bucket=bucket, Key=key)
    return response["Body"].read().decode("utf-8")


# 이미지 파일  S3에서 가져와서 base64 인코딩(전처리)
def get_base64_from_s3_url(http_url: str) -> str:
    bucket, key = parse_s3_url(http_url)
    ext = get_file_extension(http_url)
    mime_type = get_mime_type(ext)
    response = s3.get_object(Bucket=bucket, Key=key)
    encoded = base64.b64encode(response["Body"].read()).decode("utf-8")
    return {
        "base64": encoded,
        "mime": mime_type
    }

# 텍스트 + 이미지 구분해서 전처리
# 섞여있는 url List를 받아서 텍스트 파일은 하나의 combined_text로, 이미지는 전처리된 리스트로 return
def load_text_and_images(chat_urls: List[str]) -> Tuple[str, List[str]]:
    texts = []
    base64_images = []

    for url in chat_urls:
        ext = get_file_extension(url)
        if ext == "txt":
            text = get_text_from_s3_url(url)
            texts.append(text)
        elif ext in ["jpg", "jpeg", "png", "webp"]:
            base64_img = get_base64_from_s3_url(url)
            base64_images.append(base64_img)
        else:
            print(f"지원하지 않는 형식: {ext} (url: {url})")

# texts 리스트가 비어 있으면 combined_text 는 ""(빈 문자열)
    combined_text = "\n".join(texts)
    return combined_text, base64_images

def load_text(chat_urls: List[str]) -> Tuple[str, List[str]]:
    texts = []

    for url in chat_urls:
        ext = get_file_extension(url)
        if ext in ["txt", "csv"]:
            text = get_text_from_s3_url(url)
            texts.append(text)
        # else:
        #     print(f"지원하지 않는 형식: {ext} (url: {url})")

# texts 리스트가 비어 있으면 combined_text 는 ""(빈 문자열)
    combined_text = "\n".join(texts)
    return combined_text