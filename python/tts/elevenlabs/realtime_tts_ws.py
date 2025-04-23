import websockets
import base64
import os
import json
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("VOICE_ID")  # 클론된 voice_id

async def stream_tts_audio(websocket: WebSocket, reply: str):
    print("[전화서비스 TTS] ElevenLabs TTS 시작")

    elevenlabs_ws_uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream"
    headers = [("xi-api-key", API_KEY)]

    try:
        async with websockets.connect(elevenlabs_ws_uri, extra_headers=headers) as eleven_ws:
            # 텍스트 전송
            await eleven_ws.send(json.dumps({
                "text": reply,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.4,
                    "similarity_boost": 0.85
                }
            }))

            # 오디오 chunk 수신 및 전달
            while True:
                try:
                    message = await eleven_ws.recv()
                    parsed = json.loads(message)

                    if "audio" in parsed:
                        chunk = base64.b64decode(parsed["audio"])
                        await websocket.send_bytes(chunk)

                    elif parsed.get("isFinal"):
                        print("[전화서비스 TTS] 최종 chunk 수신 완료")
                        break

                except Exception as e:
                    print(f"[ElevenLabs 수신 오류]: {e}")
                    break

        await websocket.send_text(json.dumps({"type": "tts_end"}))
        print("[전화서비스 TTS] 오디오 스트리밍 완료")

    except Exception as e:
        print("[전화서비스 TTS] WebSocket 오류:", e)
