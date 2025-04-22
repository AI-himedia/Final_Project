from fastapi import APIRouter, Request
import time
from datetime import datetime
from fastapi import APIRouter
from llm.models.request_models import ServiceStartRequest
from llm.services import file_loader, llm_prompt, llm_executor, result_parser, db_writer, utils

sms_init_router = APIRouter()

@sms_init_router.post("/ai/sms/service/start")
async def start_service(req: ServiceStartRequest):
    
    start_time = time.time()

    try:
        # UnboundLocalError 방지를 위한 기본값 지정
        parsed = None
        deceased_data = req.deceasedData
        analyzable_files = req.analyzableFiles
        chatFileUrls = [file.fileUrl for file in analyzable_files]

        # 초기값
        previous_result = {
            "tone_style": None,
            "common_phrases": [],
            "example_lines": []
        }

        print("------------------------------------------")
        print('deceased_data:', deceased_data)
        print('analyzable_files:', analyzable_files)
        if analyzable_files:
            # url 리스트로 S3에서 파일 가져와서 전처리
            # combined_text, base64_images = file_loader.load_text_and_images(req.chatFileUrls)
            # combined_text = file_loader.load_text(req.chatFileUrls)
            # print("------------------------------------------")
            # print('combined_text:', combined_text)
            # print('base64_images:', base64_images)

            for index, file in enumerate(analyzable_files):
                print(f"\n--- 분석 {index + 1}/{len(analyzable_files)} ---")
                print(f"파일 URL: {file.fileUrl}")
                print(f"힌트: {file.deceasedHint}")

                # 1. 파일 처리 (텍스트 or 이미지)
                if file.fileUrl.endswith((".txt", ".csv")):
                    combined_text = file_loader.load_text([file.fileUrl])
                    images = []
                else:
                    combined_text = ""
                    images = [file.presignedUrl] if file.presignedUrl else []

                # 2. 프롬프트 생성 (이전 분석 결과 포함)
                prompt = llm_prompt.build_analysis_messages_incrementally(
                    previous_result,
                    combined_text,
                    images,
                    file.deceasedHint,
                )

                # 3. LLM 실행
                llm_result, token_count = llm_executor.run_analysis(prompt)
                print("------------------------------------------")
                print('llm_result:', llm_result)
                print('token_count:', token_count)

                # 4. 결과 파싱 및 누적
                parsed = result_parser.parse_response(llm_result)
                previous_result = utils.merge_analysis_results(previous_result, parsed)
                print(f"[{index+1}] 분석 완료: {parsed}")
                print("------------------------------------------")
                print('previous_result:', previous_result)


            # 동적으로 prompt 생성
            # prompt = llm_prompt.build_analysis_messages(combined_text, base64_images)
            # prompt = llm_prompt.build_analysis_messages_with_presigned_urls(combined_text, req.presignedUrls, req.deceasedData)
            print("------------------------------------------")
            # print('prompt:', prompt)

            # LLM api 실행
            # llm_result, token_count = llm_executor.run_analysis(prompt)
            # print("------------------------------------------")
            # print('llm_result:', llm_result)
            # print('token_count:', token_count)

            # DB에 넣을수 있게 response 파싱
            # parsed = result_parser.parse_response(llm_result)
            # print("------------------------------------------")
            # print('parsed:', parsed)


            # LLM 분석 결과 병합
            deceased_data.toneStyle = parsed.get("tone_style")
            deceased_data.commonPhrases = parsed.get("common_phrases")
            deceased_data.exampleLines = parsed.get("example_lines")


        print("------------------------------------------")
        print('deceased_data:', deceased_data)
        print('subscriptionCode:', req.subscriptionCode)
        print('chatFileUrls:', chatFileUrls)

        db_writer.save_all_to_db(req.subscriptionCode, deceased_data, chatFileUrls)

        end_time = time.time()
        # 성능 계산용 시간 체크
        time_taken = end_time - start_time

        # 소요시간
        print("------------------------------------------")
        print('Time Taken (seconds):', time_taken)
        print('token_count:', token_count)
        print('local time:', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

        return {"status": "success", "message": "분석 및 저장 완료"}

    except Exception as e:
        print(" 에러 발생:", e)
        return {"status": "error", "message": str(e)}

# 201 return {"status": "success", "message": "대화록 캡쳐본을 올려주세요"}