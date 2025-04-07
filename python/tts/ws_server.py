import asyncio
from websockets.legacy.server import serve, WebSocketServerProtocol
import json
import queue
import base64
from stt_google_api import run_streaming_stt
from test import run_llm, run_tts

# TTS 호출
async def run_tts(text: str) -> bytes:
    return b"FAKE_TTS_AUDIO_BYTES"  # 실제 TTS 바이트 데이터


async def handler(websocket: WebSocketServerProtocol):
    print("클라이언트 연결됨")
    audio_queue = queue.Queue()
    responses = run_streaming_stt(audio_queue)
    seen_final_transcripts = set()
    last_partial_transcript = ""

    # 오디오 수신 비동기 처리
    async def receive_audio():
        try:
            async for message in websocket:
                if isinstance(message, bytes):
                    audio_queue.put(message)
                elif isinstance(message, str):
                    try:
                        data = json.loads(message)
                        if data.get("event") == "end":
                            print("수신 종료 신호")
                            audio_queue.put(None)
                            break
                    except Exception as e:
                        print("JSON 파싱 오류:", e)
        except Exception as e:
            print("WebSocket 수신 중 오류:", e)

    # STT 결과 처리 비동기
    async def process_stt_results():
        nonlocal last_partial_transcript
        print("응답 수신 대기 중")
        try:
            for response in responses:
                print("응답 수신됨")
                if not response.results:
                    continue
                for result in response.results:
                    if not result.alternatives:
                        continue

                    transcript = result.alternatives[0].transcript.strip()

                    if result.is_final:
                        if transcript and transcript not in seen_final_transcripts:
                            seen_final_transcripts.add(transcript)
                            print("[최종 결과]", transcript)
                            try:
                                await websocket.send(json.dumps({
                                    "type": "stt",
                                    "text": transcript,
                                    "is_final": True
                                }))
                            except Exception as e:
                                print("클라이언트에게 전송 실패:", e)
                    else:
                        if transcript and transcript != last_partial_transcript:
                            last_partial_transcript = transcript
                            print("[중간 결과]", transcript)
                            try:
                                await websocket.send(json.dumps({
                                    "type": "stt",
                                    "text": transcript,
                                    "is_final": False
                                }))
                            except Exception as e:
                                print("중간 결과 전송 실패:", e)
                            
                    # 최종 결과가 확인되면 LLM + TTS 처리
                    if result.is_final:
                        try:
                            response_text = run_llm(transcript)
                            tts_audio = run_tts(response_text)

                            await websocket.send(json.dumps({
                                "type": "tts",
                                "data": base64.b64encode(tts_audio).decode("utf-8")
                            }))
                            print("TTS 전송 완료")

                        except Exception as e:
                            print("TTS 처리 오류:", e)

        except Exception as e:
            print("STT 처리 오류:", e)

    # 동시에 실행
    await asyncio.gather(
        receive_audio(),
        process_stt_results()
    )

    print("클라이언트 연결 종료")


async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()  # 무한 대기

if __name__ == "__main__":
    asyncio.run(main())

