import asyncio
import base64
import json
import queue
from websockets.legacy.server import serve, WebSocketServerProtocol

from stt_google_api import run_streaming_stt
from tts_test import run_llm, run_tts


async def handler(websocket: WebSocketServerProtocol):
    print("클라이언트 연결됨")

    while True:
        audio_queue = queue.Queue()
        stt_done = asyncio.Event()
        responses = run_streaming_stt(audio_queue)

        seen_final_transcripts = set()
        last_partial_transcript = ""

        async def receive_audio():
            try:
                async for message in websocket:
                    if isinstance(message, bytes):
                        audio_queue.put(message)
                    elif isinstance(message, str):
                        data = json.loads(message)
                        if data.get("event") == "end":
                            print("클라이언트 종료 요청 수신")
                            audio_queue.put(None)
                            break
            except Exception as e:
                print("WebSocket 수신 오류:", e)
                audio_queue.put(None)

        async def process_call_result():
            nonlocal last_partial_transcript
            try:
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
                                print(f"최종 STT: {transcript}")

                                # # LLM → TTS
                                # try:
                                #     response_text = run_llm(transcript)
                                #     print(f"LLM 응답: {response_text}")
                                #     tts_audio = run_tts(response_text)

                                #     await websocket.send(json.dumps({
                                #         "type": "tts",
                                #         "data": base64.b64encode(tts_audio).decode("utf-8")
                                #     }))
                                #     print("TTS 전송 완료")

                                # except Exception as e:
                                #     print("TTS 처리 오류:", e)

                                try:
                                    texts = ["안녕", "지금 시간은?", "테스트."]
                                    for text in texts:
                                        response_text = run_llm(text)
                                        print(f"TTS 생성 시작: {response_text}")

                                        audio_data = run_tts(response_text)

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

                                stt_done.set()
                                return
                            
            except Exception as e:
                print("STT 처리 오류:", e)
                stt_done.set()

        await asyncio.gather(receive_audio(), process_call_result())
        await stt_done.wait()
        print("STT 세션 종료. 다음 발화 대기 중")


async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
