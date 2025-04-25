import asyncio
import base64
import json
from websockets import serve
from tts.test.test_tts import initialize_tts_environment
from tts.sparkTTS_voice_embedding import cache_embedding_data, ensure_model_loaded, run_tts

# 예시 임베딩 (DB에서 가져온 것처럼)
# 추후에 변경 예정 (웹소켓 서버 여부에 따라)
embedding_data = [[[3199,253,1592,4042,290,1733,1056,2665,3594,3475,672,3142,738,3628,3253,3101,1084,3088,3227,1261,541,2425,2271,1461,1602,204,3531,3143,3780,2572,2946,135]]]


async def handler(websocket):
    print("클라이언트 연결됨")

    try:
        texts = ["안녕하세요.", "지금 시간은?", "테스트."]
        for text in texts:
            response_text = text

            audio_data = await run_tts(response_text)

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
    cache_embedding_data(embedding_data)
    ensure_model_loaded()
    asyncio.run(main())