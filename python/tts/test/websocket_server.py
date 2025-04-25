import asyncio
import base64
import json
import uuid
import time
# from websockets.legacy.server import serve, WebSocketServerProtocol
from websockets.server import serve
import traceback
from stt.call_stt import run_streaming_stt
from tts.sparkTTS_voice_embedding import run_tts, initialize_tts_environment
from api.response_generator import generate_response, ChatRequest


MIN_AUDIO_CHUNKS = 1

# async def handler(websocket: WebSocketServerProtocol):
async def handler(websocket):

    print("클라이언트 연결됨")

    try:
        start_total = time.time()
        while True:
            # 클라이언트에게 STT 준비 완료 신호 보내기
            await websocket.send(json.dumps({"event": "ready"}))
        
            session_id = str(uuid.uuid4())
            print(f"[{session_id}] STT 세션 시작")

            audio_queue = asyncio.Queue()
            stt_done = asyncio.Event()
            audio_received = asyncio.Event()

            seen_final_transcripts = set()
            received_chunks = 0
            user_requested_disconnect = False
            # 클라이언트가 ready 신호를 보내야만 시작
            initial_ready = False

            async def receive_audio():
                nonlocal received_chunks, user_requested_disconnect, initial_ready
                try:
                    async for message in websocket:
                        if isinstance(message, bytes):
                            if not initial_ready:
                                continue
                            received_chunks += 1
                            await audio_queue.put(message)
                            audio_received.set()
                        elif isinstance(message, str):
                            data = json.loads(message)
                            event_type = data.get("event")
                            if event_type == "ready":
                                print(f"[{session_id}] 클라이언트로부터 STT 준비 신호 수신")
                                initial_ready = True
                            elif event_type == "end":
                                print("클라이언트 종료 요청 수신")
                                if not audio_received.is_set():
                                    print("오디오 없이 종료 요청 수신됨")
                                user_requested_disconnect = True
                                await audio_queue.put(None)
                                break
                except Exception as e:
                    print("WebSocket 수신 오류:", e)
                    await audio_queue.put(None)
                    audio_received.set()  # 에러 발생 시에도 unblock
                    user_requested_disconnect = True

            async def process_call_result():
                try:
                    print(f"[{session_id}] 답변 생성 시작")
                    responses = await run_streaming_stt(audio_queue)

                    # STT 결과
                    for response in responses:    
                        for result in response.results:
                            if result.is_final:
                                stt_start = time.time()
                                transcript = result.alternatives[0].transcript.strip()
                                if not transcript or transcript in seen_final_transcripts:
                                    continue

                                seen_final_transcripts.add(transcript)
                                print(f"[{session_id}] 최종 STT: {transcript}")
                                print(f"STT 처리 시간: {int((time.time() - stt_start) * 1000)}ms")
                            
                                # LLM
                                try:
                                    print(f"[{session_id}] LLM 호출")
                                    llm_start = time.time()
                                    chat_input = ChatRequest(subscriptionCode=300, userInput=transcript)
                                    response_llm = generate_response(chat_input)
                                    response_llm = "test"
                                    print(f"[{session_id}] LLM 응답 전체: {response_llm}")
                                    print(f"[{session_id}] WebSocket에 전송 직전")
                                    message_to_send = {
                                        "type": "llm",
                                        "data": response_llm
                                    }
                                    print('[서버에서 전송할 메시지]:', message_to_send)
                                   
                                    try:
                                        await websocket.send(json.dumps({"event": "ready"}))
                                        await websocket.send(json.dumps(message_to_send))
                                        print(f"[{session_id}] WebSocket 전송 완료")
                                    except Exception as e:
                                        print(f"[{session_id}] WebSocket 전송 중 오류 발생:", e)
                                        
                                        traceback.print_exc()
                                    print(f"[{session_id}] LLM 응답: {response_llm['message']}")
                                    print(f"LLM 처리 시간: {int((time.time() - llm_start) * 1000)}ms")
                                    
                                except Exception as e:
                                    print(f"[{session_id}] LLM 처리 오류:", e)
                                    return

                                # TTS
                                if not websocket.closed and "message" in response_llm:
                                    try:
                                        print(f"[{session_id}] TTS 호출 준비됨")
                                        tts_start = time.time()
                                        tts_audio = run_tts(response_llm["message"])
                                        b64_audio = base64.b64encode(tts_audio).decode("utf-8")
                                        print(f"[{session_id}] 전송할 base64 길이: {len(b64_audio)}")
                                        if not websocket.closed:
                                            await websocket.send(json.dumps({
                                                "type": "tts",
                                                "data": b64_audio
                                            }))
                                            print(f"[{session_id}] TTS 전송 완료")
                                        else:
                                            print(f"[{session_id}] WebSocket이 이미 닫혀서 TTS 전송 불가")
                                        print(f"TTS 처리 시간: {int((time.time() - tts_start) * 1000)}ms")
                                    except Exception as e:
                                        print(f"[{session_id}] TTS 처리 오류:", e)
                                return
                    print(f"[{session_id}] STT 결과 없음 - 강제 종료")
                    stt_done.set()
                except Exception as e:
                    print(f"[{session_id}] STT 처리 오류:", e)
                    stt_done.set()

            # 오디오 먼저 받기
            receive_task = asyncio.create_task(receive_audio())
            print(f"[{session_id}] 오디오 수신 대기 중")
            await audio_received.wait()
            await asyncio.sleep(0.5)

            if user_requested_disconnect:
                print(f"[{session_id}] 클라이언트 종료 요청 수신. STT 종료")
                await audio_queue.put(None)
                await receive_task
                break

            
            if received_chunks < MIN_AUDIO_CHUNKS:
                print(f"[{session_id}] 오디오 수신량 부족 ({received_chunks}개). STT 호출 종료")
                await audio_queue.put(None)  # 종료 신호 정리
                await receive_task  # 수신 task 정리
                continue 

            # STT task 시작
            print(f"[{session_id}] 오디오 수신됨, STT 시작")
            process_task = asyncio.create_task(process_call_result())
            # STT 처리 
            await asyncio.gather(receive_task, process_task)
            await stt_done.wait()

            print(f"[세션 ID: {session_id}] STT 세션 종료. 다음 발화 대기 중")
            if websocket.closed or user_requested_disconnect:
                print(f"[{session_id}] 클라이언트 요청으로 루프 종료")
                break

        print(f"[총 처리 시간] {int((time.time() - start_total) * 1000)}ms")
    except Exception as e:
        print("[서버 오류] handler 루프 에러:", e)

async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()


if __name__ == "__main__":
    initialize_tts_environment()
    asyncio.run(main())