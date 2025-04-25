import asyncio
import base64
import json
import uuid
import time
from websockets.legacy.server import serve, WebSocketServerProtocol
from python.stt.call_stt import run_streaming_stt
from tts.test.test_tts import run_tts, initialize_tts_environment
from api.response_generator import generate_response, ChatRequest
import traceback
import functools

MIN_AUDIO_CHUNKS = 1
print = functools.partial(print, flush=True)


async def handler(websocket: WebSocketServerProtocol):
    print("\n클라이언트 연결됨")
    try:
        start_total = time.time()
        while True:
            await websocket.send(json.dumps({"event": "ready"}))

            session_id = str(uuid.uuid4())
            print(f"[{session_id}] STT 세션 시작")

            audio_queue = asyncio.Queue()
            stt_done = asyncio.Event()
            audio_received = asyncio.Event()
            seen_final_transcripts = set()
            received_chunks = 0
            user_requested_disconnect = False
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
                                print(f"[{session_id}] 클라이언트 종료 요청 수신")
                                user_requested_disconnect = True
                                await audio_queue.put(None)
                                break
                except Exception as e:
                    print(f"[{session_id}] WebSocket 수신 오류:", e)
                    await audio_queue.put(None)
                    audio_received.set()
                    user_requested_disconnect = True

            async def async_tts_and_send(text):
                try:
                    print(f" [{session_id}] TTS 호출 준비됨 (비동기)")
                    tts_start = time.time()
                    tts_audio = await run_tts(text)
                    b64_audio = base64.b64encode(tts_audio).decode("utf-8")
                    print(f"[{session_id}] 전송할 base64 길이: {len(b64_audio)}")
                    if not websocket.closed:
                        print(f"[{session_id}] 웹소켓 상태 OK")
                        await websocket.send(json.dumps({
                            "type": "tts",
                            "data": b64_audio
                        }))
                        print(f" [{session_id}] TTS 전송 완료")
                    else:
                        print(f"[{session_id}] WebSocket이 이미 닫혀서 TTS 전송 불가")
                    print(f"TTS 처리 시간: {int((time.time() - tts_start) * 1000)}ms")
                except Exception as e:
                    print(f"[{session_id}] TTS 비동기 처리 오류:", e)
                    traceback.print_exc()

            async def process_call_result():
                try:
                    print(f" [{session_id}] 답변 생성 시작")
                    responses = await run_streaming_stt(audio_queue)
                    for response in responses:
                        for result in response.results:
                            if result.is_final:
                                stt_start = time.time()
                                transcript = result.alternatives[0].transcript.strip()
                                if not transcript or transcript in seen_final_transcripts:
                                    continue

                                seen_final_transcripts.add(transcript)
                                print(f" [{session_id}] 최종 STT: {transcript}")
                                print(f"STT 처리 시간: {int((time.time() - stt_start) * 1000)}ms")

                                try:
                                    print(f" [{session_id}] LLM 호출")
                                    llm_start = time.time()
                                    chat_input = ChatRequest(subscriptionCode=300, userInput=transcript)
                                    response_llm = generate_response(chat_input)
                                    print(f"[{session_id}] LLM 응답: {response_llm['message']}")
                                    print(f"[{session_id}] LLM 응답 전체: {response_llm}")
                                    print(f"LLM 처리 시간: {int((time.time() - llm_start) * 1000)}ms")
                                    await websocket.send(json.dumps({
                                        "type": "llm",
                                        "data": response_llm
                                    }))
                                except Exception as e:
                                    print(f"[{session_id}] LLM 처리 오류:", e)
                                    return
                                print(f"[{session_id}] response_llm raw: {json.dumps(response_llm, ensure_ascii=False)}")

                                try:
                                    if not websocket.closed and "message" in response_llm:
                                        print(f"[{session_id}] LLM 메시지 있음, TTS 실행 준비")
                                        asyncio.create_task(
                                            async_tts_and_send(websocket, response_llm["message"], session_id)
                                        )
                                        await asyncio.sleep(2)
                                    else:
                                        print(f"[{session_id}] 조건 불충족 - WebSocket 닫힘 여부: {websocket.closed}, message 존재 여부: {'message' in response_llm}")
                                except Exception as e:
                                    print(f"[{session_id}] create_task() 호출 중 오류 발생: {e}")
                                    import traceback
                                    traceback.print_exc()

                    print(f"[{session_id}] STT 결과 없음 - 강제 종료")
                    stt_done.set()
                except Exception as e:
                    print(f"[{session_id}] STT 처리 오류:", e)
                    stt_done.set()

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
                await audio_queue.put(None)
                await receive_task
                continue

            print(f"[{session_id}] 오디오 수신됨, STT 시작")
            process_task = asyncio.create_task(process_call_result())

            await asyncio.gather(receive_task, process_task)
            await stt_done.wait()
            
            print(f"[ 세션 종료] {session_id}")
            if websocket.closed or user_requested_disconnect:
                break

        print(f"[ 총 처리 시간] {int((time.time() - start_total) * 1000)}ms")

    except Exception as e:
        print("[ 서버 오류] handler 루프 에러:", e)


async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()


if __name__ == "__main__":
    initialize_tts_environment()
    asyncio.run(main())
