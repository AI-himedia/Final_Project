# fastapi_websocket_server.py
import asyncio
import uvicorn
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import WebSocketRoute
from starlette.websockets import WebSocket as StarletteWebSocket

from tts.stt_google_api import run_streaming_stt
from api.response_generator import generate_response, ChatRequest
from tts.tts_streaming import stream_tts

app = FastAPI()


CHUNK_SIZE = 4096
MIN_AUDIO_CHUNKS = 1


@app.websocket("/be/ws/python")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[전화 서비스 handler] Spring boot 연결됨")
    
    audio_queue = asyncio.Queue()
    stt_done = asyncio.Event()
    received_chunks = [0]

    try:
        while websocket.client_state.name == "CONNECTED":
            audio_received = asyncio.Event()

            print("[전화 서비스 handler] 오디오 수신 대기 중")
            receive_task = asyncio.create_task(
                receive_audio(websocket, audio_queue, stt_done, received_chunks, audio_received)
            )

            await audio_received.wait()
            # await asyncio.sleep(0.5)

            while received_chunks[0] < MIN_AUDIO_CHUNKS:
                await asyncio.sleep(0.1)

            print("\n[전화 서비스 handler] 새 오디오 입력 대기 중")
            process_task = asyncio.create_task(process_stt(websocket, audio_queue))

            await asyncio.gather(receive_task, process_task)

            if websocket.client_state.name == "DISCONNECTED":
                print("[handler] 클라이언트가 연결을 종료함")
                break

            print("[전화 서비스 handler] 대화 흐름 1회 완료\n")

    except WebSocketDisconnect:
        print("[전화 서비스 handler] 연결 끊김")


async def receive_audio(websocket: WebSocket, audio_queue, stt_done, received_chunks, audio_received):
    print("[전화서비스] 오디오 큐 수신 시작")

    try:
        while True:
            data = await websocket.receive()
            print("[FastAPI 수신 데이터]:", data)
            if "text" in data:
                try:
                    msg = json.loads(data["text"])
                    if msg.get("event") == "end":
                        print("[전화서비스] 클라이언트 종료 명령 수신 → STT 종료")
                        await audio_queue.put(None)
                        break
                except Exception as e:
                    print("[수신 오류] JSON 파싱 오류:", e)
            elif "bytes" in data:
                received_chunks[0] += 1
                await audio_queue.put(data["bytes"])
                if not audio_received.is_set():
                    audio_received.set()

    except Exception as e:
        print("[WebSocket 에러]:", e)
    finally:
        await audio_queue.put(None)
        stt_done.set()
        print("[전화서비스] 오디오 큐 종료 신호 수신 (None)")


async def process_stt(websocket: WebSocket, audio_queue):
    print("[전화서비스] run_streaming_stt() 호출 시작")
    responses = await run_streaming_stt(audio_queue)

    seen_final_transcripts = set()
    last_partial_transcript = ""
    final_result = None

    for response in responses:
        if not response.results:
            continue
        for result in response.results:
            if not result.alternatives:
                continue

            transcript = result.alternatives[0].transcript.strip()

            if result.is_final:
                if transcript and transcript not in seen_final_transcripts:
                    seen_final_transcripts.add(transcript)
                    final_result = transcript
                    print("[전화서비스]최종 STT 결과:", final_result)

                    await websocket.send_text(json.dumps({"type": "stt_end"}))
                    await process_llm_and_tts(websocket, final_result)
                    return
            else:
                if transcript != last_partial_transcript:
                    last_partial_transcript = transcript
                    print("[전화서비스]중간 STT:", transcript)

    if final_result is None and last_partial_transcript:
        print("[전화서비스] 최종 STT 없음. 마지막 중간 결과로 처리:", last_partial_transcript)
        await websocket.send_text(json.dumps({"type": "stt_end"}))
        await process_llm_and_tts(websocket, last_partial_transcript)


async def process_llm_and_tts(websocket: WebSocket, final_result):
    try:
        print("[전화서비스 LLM] LLM 호출")
        chat_input = ChatRequest(subscriptionCode=300, userInput=final_result)
        llm_response = generate_response(chat_input)
        reply = llm_response["message"]
        print("[전화서비스 LLM] 답장:", reply)

        await stream_tts_audio(websocket, reply)
    except Exception as e:
        print("[LLM → TTS 흐름 오류]:", e)


async def stream_tts_audio(websocket: WebSocket, reply):
    try:
        print("[전화서비스 TTS] Spark-TTS 음성 생성 시작")
        audio_bytes = await stream_tts(reply)
        print(f"[전화서비스 TTS] 오디오 총 길이: {len(audio_bytes)} bytes")

        await websocket.send_text(json.dumps({"type": "tts_start"}))

        for i in range(0, len(audio_bytes), CHUNK_SIZE):
            chunk = audio_bytes[i:i + CHUNK_SIZE]
            await websocket.send_bytes(chunk)

        await websocket.send_text(json.dumps({"type": "tts_end"}))
        print("[전화서비스 TTS] 오디오 스트리밍 완료")

    except Exception as e:
        print("[전화서비스 TTS] 스트리밍 중 오류:", e)


if __name__ == "__main__":
    uvicorn.run(
        "fastapi_websocket_server:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        ws_ping_interval=30,      # 30초마다 ping
        ws_ping_timeout=60,       # 60초까지 pong 없으면 끊음
    )
