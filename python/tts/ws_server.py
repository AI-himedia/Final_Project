import asyncio
from websockets.legacy.server import serve, WebSocketServerProtocol
import json
import queue
import base64
from stt_google_api import run_streaming_stt


# LLM 호출
async def run_llm(text: str) -> str:
    return f"LLM 응답: '{text}'"

# TTS 호출
async def run_tts(text: str) -> bytes:
    return b"FAKE_TTS_AUDIO_BYTES"  # 실제 TTS 바이트 데이터


async def handler(websocket: WebSocketServerProtocol):
    print("클라이언트 연결됨")
    audio_queue = queue.Queue()

    # Google STT 스트리밍 비동기 실행
    loop = asyncio.get_event_loop()
    stt_task = loop.run_in_executor(None, lambda: run_streaming_stt(audio_queue))

    # 클라이언트로부터 오디오 수신
    try:
        async for message in websocket:
            if isinstance(message, bytes):
                audio_queue.put(message)
            elif isinstance(message, str):
                try:
                    data = json.loads(message)
                    if data.get("event") == "end":
                        print("수신 종료 신호")
                        audio_queue.put(None)  # STT 종료 신호
                        break
                except Exception as e:
                    print("JSON 파싱 오류:", e)

    except Exception as e:
        print("WebSocket 수신 중 오류:", e)

    # STT 결과 처리
    try:
        responses = await stt_task
        print("응답 수신됨")

        for response in responses:
            print("전체 응답 객체:", response)

            if not response.results:
                print("응답은 왔지만 results 없음")
                continue

            if response.results:
                for result in response.results:
                    if not result.alternatives:
                        print("결과에 대안 없음")
                        continue

                    transcript = result.alternatives[0].transcript
                    print("[인식 결과] ", transcript)

                    if result.is_final:
                        try:
                            await websocket.send(json.dumps({
                                "type": "stt",
                                "text": transcript
                            }))
                        except Exception as e:
                            print("클라이언트에게 전송 실패:", e)
                    else:
                        print("[중간 결과] ", transcript)

                    # if result.is_final:
                    # # LLM → TTS 호출
                    # response_text = await run_llm(transcript)
                    # tts_audio = await run_tts(response_text)

                    # # TTS 응답 전송
                    # try:
                    #     await websocket.send(json.dumps({
                    #         "type": "tts",
                    #         "data": base64.b64encode(tts_audio).decode("utf-8")
                    #     }))
                    #     print("TTS 전송 완료")
                    # except Exception as e:
                    #     print("클라이언트에게 전송 실패:", e)
    except Exception as e:
        print("STT 처리 오류:", e)

    print("클라이언트 연결 종료")


async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()  # 무한 대기

if __name__ == "__main__":
    asyncio.run(main())

