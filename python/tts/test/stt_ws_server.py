import asyncio
import json
import queue
from websockets.legacy.server import serve, WebSocketServerProtocol
from python.stt.call_stt import run_streaming_stt


async def handler(websocket: WebSocketServerProtocol):
    print("클라이언트 연결됨")

    while True:
        audio_queue = queue.Queue()
        responses = run_streaming_stt(audio_queue)
        seen_final_transcripts = set()
        last_partial_transcript = ""
        stt_done = asyncio.Event()

        async def receive_audio():
            try:
                async for message in websocket:
                    if isinstance(message, bytes):
                        audio_queue.put(message)
                    elif isinstance(message, str):
                        data = json.loads(message)
                        if data.get("event") == "end":
                            print("클라이언트로부터 STT 종료 요청 수신")
                            audio_queue.put(None)
                            break
            except Exception as e:
                print("WebSocket 수신 오류:", e)
                audio_queue.put(None)

        async def process_stt_results():
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
                                print("최종 STT 결과:", transcript)

                                # 클라이언트에 STT 결과 전송
                                await websocket.send(json.dumps({
                                    "type": "stt",
                                    "text": transcript,
                                    "is_final": True
                                }))

                                # 세션 종료
                                stt_done.set()
                                return
                        else:
                            if transcript != last_partial_transcript:
                                last_partial_transcript = transcript
                                print("중간 STT:", transcript)
                                await websocket.send(json.dumps({
                                    "type": "stt",
                                    "text": transcript,
                                    "is_final": False
                                }))
            except Exception as e:
                print("STT 처리 오류:", e)
                stt_done.set()

        await asyncio.gather(receive_audio(), process_stt_results())
        await stt_done.wait()
        print("STT 세션 종료")


async def main():
    print("WebSocket 서버 실행 중 (포트 8765)")
    async with serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())