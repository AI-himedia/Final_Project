import asyncio
import websockets
import json
import base64
import python.tts.stt_test as stt


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
    async for message in websocket:
        try:
            msg = json.loads(message)
            if msg.get("type") == "audio":
                audio_bytes = base64.b64decode(msg["data"])

                text = await run_stt(audio_bytes)

                # 클라이언트로 STT 결과 전송
                await websocket.send(json.dumps({
                    "type": "stt",
                    "text": text
                }))

        except Exception as e:
            print("에러 발생:", e)
            await websocket.send(json.dumps({
                "type": "error",
                "message": str(e)
            }))

start_server = websockets.serve(handler, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
print("WebSocket 서버 실행 중 (포트 8765)")
asyncio.get_event_loop().run_forever()
