from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
import shutil
import os

audio_router = APIRouter()

class AudioProcessResponse(BaseModel):
    status: str
    message: str
    file_info: dict = None

@audio_router.post("/ai/process-audio", response_model=AudioProcessResponse)
async def process_audio(
    file: UploadFile = File(...),
    subscription_code: int = Form(...)
):
    try:
        # 기본 저장 디렉토리 확인 및 생성
        base_dir = "./received_files"
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            print(f"기본 디렉토리 생성 완료: {base_dir}")
        
        # 구독 코드별 저장 디렉토리 생성
        save_dir = os.path.join(base_dir, str(subscription_code))
        os.makedirs(save_dir, exist_ok=True)
        
        # 원본 파일명 그대로 저장
        save_filename = file.filename
        save_path = os.path.join(save_dir, save_filename)
        
        # 파일 저장
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"파일 저장 완료: {save_path}, 구독 코드: {subscription_code}")
        
        # 파일 정보
        file_info = {
            "original_filename": file.filename,
            "saved_filename": save_filename,
            "saved_path": save_path,
            "subscription_code": subscription_code,
            "file_size_bytes": os.path.getsize(save_path)
        }
        
        # 응답 반환
        return AudioProcessResponse(
            status="success",
            message="파일이 성공적으로 저장되었습니다",
            file_info=file_info
        )
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return AudioProcessResponse(
            status="error",
            message=f"파일 저장 중 오류 발생: {str(e)}"
        )