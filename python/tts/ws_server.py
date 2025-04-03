import asyncio
import websockets
import json
import queue
from stt_google_api import run_streaming_stt


# STT 응답
async def run_stt(audio_data=None):
    return stt.run_stt_from_bytes(audio_data)

# LLM 호출
async def run_llm(text: str) -> str:
    return f"LLM이 '{text}'에 대한 답변입니다."

# TTS 호출
async def run_tts(text: str) -> bytes:
    # TTS 호출해서 음성 데이터(byte) 반환
    return b"FAKEAUDIOBYTES"  # 실제론 바이너리 오디오

# async def handler(websocket):
#     async for message in websocket:
#         try:
#             # 메시지 파싱
#             msg = json.loads(message)
#             if msg.get("type") == "audio":
#                 # base64 디코딩
#                 audio_bytes = base64.b64decode(msg["data"])

#                 # STT → LLM → TTS
#                 text = await run_stt(audio_bytes)
#                 response_text = await run_llm(text)
#                 tts_audio = await run_tts(response_text)

#                 # 다시 클라이언트로 응답 전송
#                 await websocket.send(json.dumps({
#                     "type": "tts",
#                     "data": base64.b64encode(tts_audio).decode("utf-8")
#                 }))
#         except Exception as e:
#             print("에러 발생:", e)
#             await websocket.send(json.dumps({
#                 "type": "error",
#                 "message": str(e)
#             }))


# STT 만 테스트
async def handler(websocket):
    print("클라이언트 연결됨")
    audio_queue = queue.Queue()

    # Google STT 스트리밍 비동기 실행
    loop = asyncio.get_event_loop()
    stt_task = loop.run_in_executor(None, lambda: run_streaming_stt(audio_queue))

    try:
        async for message in websocket:
            if isinstance(message, bytes):
                audio_queue.put(message)
            elif isinstance(message, str):
                try:
                    data = json.loads(message)
                    if data.get("event") == "end":
                        audio_queue.put(None)  # STT 종료 신호
                        break
                except Exception as e:
                    print("JSON 파싱 오류:", e)

    except Exception as e:
        print("WebSocket 수신 중 오류:", e)

    # STT 결과 처리
    try:
        responses = await stt_task
        for response in responses:
            for result in response.results:
                if result.is_final:
                    transcript = result.alternatives[0].transcript
                    print("인식 결과:", transcript)

                    await websocket.send(json.dumps({
                        "type": "stt",
                        "text": transcript
                    }))
    except Exception as e:
        print("STT 처리 오류:", e)
        await websocket.send(json.dumps({
            "type": "error",
            "message": str(e)
        }))

    print("🔌 클라이언트 연결 종료")

start_server = websockets.serve(handler, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
print("WebSocket 서버 실행 중 (포트 8765)")
asyncio.get_event_loop().run_forever()
