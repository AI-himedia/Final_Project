import asyncio
import base64
import json
from websockets.server import serve
from tts_test import run_tts

async def handler(websocket):
    print("클라이언트 연결됨")

    try:
        texts = ["안녕하세요.", "지금 시간은?", "테스트."]
        for text in texts:
            response_text = text

            audio_data = run_tts(response_text, 'https://ai-himedia.s3.amazonaws.com/voice/0457bede-dada-497d-b53a-5105db61b7e6_test1.wav')

            if audio_data:
                await websocket.send(json.dumps({
                    "type": "tts",
                    "data": base64.b64encode(audio_data).decode("utf-8")
                }))
                print("TTS 전송 완료")
            else:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "TTS 생성 실패"
                }))
                print(f"TTS 실패: {text}")
                
            await asyncio.sleep(2)
    except Exception as e:
        print("서버 오류:", e)

    await websocket.close()

async def main():
    print("TTS 전용 WebSocket 서버 실행 중 (포트 8766)")
    async with serve(handler, "0.0.0.0", 8766):
        await asyncio.Future()  # 무한 대기

if __name__ == "__main__":
    asyncio.run(main())