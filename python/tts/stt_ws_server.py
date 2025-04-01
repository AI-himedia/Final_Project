import os
import asyncio
import websockets
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import speech
from google.cloud.speech import types
from dotenv import load_dotenv
import uvicorn

load_dotenv()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

app = FastAPI()

# CORS 설정 (Flutter에서 연결 시 필요할 수 있음)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google STT 스트리밍
async def stream_to_google_speech(audio_generator):
    client = speech.SpeechClient()

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="ko-KR",
        enable_automatic_punctuation=True,
    )

    streaming_config = speech.StreamingRecognitionConfig(
        config=config,
        interim_results=False,
    )

    requests = (
        speech.StreamingRecognizeRequest(audio_content=content)
        for content in audio_generator
    )

    responses = client.streaming_recognize(streaming_config, requests)

    async for response in responses:
        for result in response.results:
            if result.is_final:
                text = result.alternatives[0].transcript
                print(f"📝 인식된 문장: {text}")
                # 여기서 LLM 함수로 전달
                # response_text = send_to_llm(text)

# WebSocket + Generator 조합
@app.websocket("/stt")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🎤 클라이언트 연결됨!")

    audio_buffer = []

    async def audio_generator():
        while True:
            if audio_buffer:
                yield audio_buffer.pop(0)
            else:
                await asyncio.sleep(0.01)

    task = asyncio.create_task(stream_to_google_speech(audio_generator()))

    try:
        while True:
            data = await websocket.receive_bytes()
            audio_buffer.append(data)
    except Exception as e:
        print("❌ 연결 종료:", e)
    finally:
        task.cancel()
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run("stt_ws_server:app", host="0.0.0.0", port=8000, reload=True)
