import asyncio
from websockets.legacy.server import serve, WebSocketServerProtocol
import json
import base64
from test import run_llm, run_tts


async def handler(websocket: WebSocketServerProtocol):
    print("클라이언트 연결됨")

    # 테스트용 STT 텍스트 가정
    dummy_transcript = "테스트"

    # LLM → TTS 흐름
    try:
        llm_response = run_llm(dummy_transcript)
        print("LLM 응답:", llm_response)

        tts_audio = run_tts(llm_response)
        if not tts_audio:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "TTS 생성 실패"
            }))
            return

        await websocket.send(json.dumps({
            "type": "tts",
            "data": base64.b64encode(tts_audio).decode("utf-8")
        }))
        print("TTS 전송 완료")

    except Exception as e:
        print("TTS 테스트 중 오류 발생:", e)
        await websocket.send(json.dumps({
            "type": "error",
            "message": str(e)
        }))

    print("클라이언트 연결 종료")


async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("서버 종료됨")
