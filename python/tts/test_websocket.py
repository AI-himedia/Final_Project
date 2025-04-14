import asyncio
import base64
import json
import uuid
import time
from websockets import serve, WebSocketServerProtocol

from pydantic import BaseModel
from stt_api import run_streaming_stt
from tts_test import run_tts
from api.response_generator import generate_response

MIN_AUDIO_CHUNKS = 1
clients_info = {}

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str

async def handle_client(websocket: WebSocketServerProtocol):
    session_id = str(uuid.uuid4())
    audio_chunks = 0
    seen_final_transcripts = set()
    audio_queue = []
    ready = False

    print(f"[{session_id}] 클라이언트 연결됨")
    await websocket.send(json.dumps({"event": "ready"}))

    try:
        async for message in websocket:
            if isinstance(message, bytes):
                if not ready:
                    continue
                audio_chunks += 1
                audio_queue.append(message)
                if len(audio_queue) == 0:
                    print(f"[{session_id}] STT 요청 전에 오디오가 없음 (빈 큐)")

            
            elif isinstance(message, str):
                data = json.loads(message)
                event_type = data.get("event")

                if event_type == "ready":
                    print(f"[{session_id}] 클라이언트 준비 완료")
                    ready = True
                
                elif event_type == "end":
                    print(f"[{session_id}] 클라이언트 종료 요청")
                    if audio_chunks < MIN_AUDIO_CHUNKS:
                        print(f"[{session_id}] 오디오 수신량 부족: {audio_chunks}")
                        return

                    print(f"[{session_id}] STT 시작")
                    start = time.time()
                    stt_start = time.time()
                    with open("recorded_audio.raw", "wb") as f:
                        for chunk in audio_queue:
                            f.write(chunk)
                    responses = run_streaming_stt(audio_queue)
                    stt_end = time.time()
                    print(f"STT 처리 시간: {int((stt_end - stt_start) * 1000)}ms")

                    for response in responses:
                        print(f"[{session_id}] Google STT 응답 수신됨")
                        for result in response.results:
                            if result.is_final:
                                transcript = result.alternatives[0].transcript.strip()
                                if transcript and transcript not in seen_final_transcripts:
                                    seen_final_transcripts.add(transcript)
                                    print(f"[{session_id}] 최종 STT: {transcript}")
                                    llm_start = time.time()
                                    chat_input = ChatRequest(subscriptionCode=300, userInput=transcript)
                                    response_llm = generate_response(chat_input)
                                    llm_end = time.time()

                                    response_message = response_llm["message"]
                                    print(f"LLM 처리 시간: {int((llm_end - llm_start) * 1000)}ms")
                                    print(f"[{session_id}] LLM 응답: {response_message}")

                                    tts_start = time.time()
                                    tts_audio = run_tts(response_message)
                                    tts_end = time.time()
                                    print(f"TTS 처리 시간: {int((tts_end - tts_start) * 1000)}ms")

                                    await websocket.send(json.dumps({
                                        "type": "tts",
                                        "data": base64.b64encode(tts_audio).decode("utf-8")
                                    }))
                                    print(f"[{session_id}] TTS 전송 완료")
                                    end = time.time()
                                    print(f"[{session_id}] 총 처리 시간: {int((end - start) * 1000)}ms")
                                    return
                                    
                            elif result.alternatives:
                                interim = result.alternatives[0].transcript.strip()
                                if interim:
                                    print(f"[{session_id}] 중간 STT: {interim}")
                    print(f"[{session_id}] STT 결과 없음")
                    
    except Exception as e:
        print(f"[{session_id}] 에러 발생: {e}")
    finally:
        print(f"[{session_id}] 세션 종료")

async def main():
    print("WebSocket 서버 시작 (0.0.0.0:8765)...")
    async with serve(handle_client, "0.0.0.0", 8765, max_size=None):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())