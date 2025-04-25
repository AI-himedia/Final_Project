import asyncio
import base64
import json
from websockets.exceptions import ConnectionClosed
from python.stt.call_stt import run_streaming_stt
from websockets.server import serve
from api.response_generator import generate_response, ChatRequest
from tts.sparkTTS_voice_embedding import run_tts
from tts.test.tts_streaming import stream_tts


CHUNK_SIZE = 4096
MIN_AUDIO_CHUNKS = 1


# 오디오 수신
async def receive_audio(websocket, audio_queue, stt_done, audio_received, received_chunks):

    print("[전화서비스] 오디오 큐 수신 시작")
    
    try:
        async for data in websocket:
            # data = await websocket.recv()   
            if isinstance(data, str):
                try:
                    msg = json.loads(data)
                    if msg.get("event") == "end":
                        print("[STT] 클라이언트 종료 명령 수신 → STT 종료")
                        await audio_queue.put(None)
                        break   
                except Exception as e:
                    print("[수신 오류] JSON 파싱 오류:", e)
            else:
                received_chunks[0] += 1
                await audio_queue.put(data)
                if received_chunks[0] >= MIN_AUDIO_CHUNKS:
                    audio_received.set()
    except Exception as e:
        print("[WebSocket 에러]:", e)
    finally:
        await audio_queue.put(None)
        stt_done.set()
        print("[전화서비스] 오디오 큐 종료 신호 수신 (None)")


# STT
async def process_stt(websocket, audio_queue):
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

                    await websocket.send(json.dumps({ "type": "stt_end" }))
                    await process_llm_and_tts(websocket, final_result)
                    return
            else:
                if transcript != last_partial_transcript:
                    last_partial_transcript = transcript
                    print("[전화서비스]중간 STT:", transcript)

    # fallback 처리
    if final_result is None and last_partial_transcript:
        print("[전화서비스] 최종 STT 없음. 마지막 중간 결과로 처리:", last_partial_transcript)
        await websocket.send(json.dumps({"type": "stt_end"}))
        await process_llm_and_tts(websocket, last_partial_transcript)
        
    
# LLM → TTS 흐름 처리
async def process_llm_and_tts(websocket, final_result):
    try:
        print("[전화서비스 LLM] LLM 호출")
        chat_input = ChatRequest(subscriptionCode=300, userInput=final_result)
        llm_reponse = generate_response(chat_input)
        reply = llm_reponse['message']
        print("[전화서비스 LLM] 답장:", reply)

        # await process_tts(websocket, reply)
        await stream_tts_audio(websocket, reply)
        
    except Exception as e:
        print("[LLM → TTS 흐름 오류]:", e)
        import traceback
        traceback.print_exc()

# TTS
async def process_tts(websocket, reply):
    try:
        print("[전화서비스 TTS] TTS 호출")
        tts_audio = await run_tts(reply)
        b64_audio = base64.b64encode(tts_audio).decode("utf-8")

        if not websocket.closed:
            await websocket.send(json.dumps({
                "type": "tts",
                "data": b64_audio
            }))
            print("[전화서비스 TTS] TTS 전송 완료")

    except Exception as e:
        print("[전화서비스 TTS] TTS 비동기 처리 오류:", e)


# TTS 스트리밍 전송
async def stream_tts_audio(websocket, reply):
    try:
        print("[전화서비스 TTS] Spark-TTS 음성 생성 시작")

        # Spark-TTS로 음성 생성 (bytes 반환)
        audio_bytes = await stream_tts(reply)

        print(f"[전화서비스 TTS] 오디오 총 길이: {len(audio_bytes)} bytes")

        # 시작 알림
        await websocket.send(json.dumps({"type": "tts_start"}))

        # chunk 단위로 전송
        for i in range(0, len(audio_bytes), CHUNK_SIZE):
            chunk = audio_bytes[i:i+CHUNK_SIZE]
            await websocket.send(chunk)  # binary frame

        # 종료 알림
        await websocket.send(json.dumps({"type": "tts_end"}))

        print("[전화서비스 TTS] 오디오 스트리밍 완료")

    except Exception as e:
        print("[전화서비스 TTS] 스트리밍 중 오류:", e)


# 메인 핸들러
async def handler(websocket):
    received_chunks = [0]
    print("[전화 서비스 handler] Spring boot 연결됨")
    
    try:
        while True:
            audio_queue = asyncio.Queue()
            stt_done = asyncio.Event()
            audio_received = asyncio.Event()

            receive_task = asyncio.create_task(receive_audio(websocket, audio_queue, stt_done, audio_received, received_chunks))
            print("[전화 서비스 handler] 오디오 수신 대기 중")
            await audio_received.wait()
            await asyncio.sleep(0.5)

            while received_chunks[0] < MIN_AUDIO_CHUNKS:
                await asyncio.sleep(0.1)

            print("\n[전화 서비스 handler] 새 오디오 입력 대기 중")
            process_task = asyncio.create_task(process_stt(websocket, audio_queue))

            await asyncio.gather(receive_task, process_task)

            if websocket.close_code is not None:
                print("[handler] 연결 종료 코드:", websocket.close_code)
                break

            print("[전화 서비스 handler] 대화 흐름 1회 완료\n")
    
    except ConnectionClosed:
        print("[전화 서비스 handler] 연결 예외 종료")


async def main():
    server = await serve(handler, "0.0.0.0", 8000)
    print("Python WebSocket 서버 실행 중 (ws://localhost:8000)")
    await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())