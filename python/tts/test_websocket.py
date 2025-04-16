import asyncio
from stt_google_api import run_streaming_stt
from websockets.server import serve



async def handler(websocket):
    print("[WebSocket 연결] Spring boot와 연결됨")

    audio_queue = asyncio.Queue()
    stt_done = asyncio.Event()
    
    async def receive_audio():
        try:
            while True:
                data = await websocket.recv()
                if isinstance(data, str):
                    print("문자열 데이터 수신됨 (오디오가 아님)")
                    continue

                print(f"[오디오 수신] {len(data)} bytes")
                await audio_queue.put(data)

        except Exception as e:
            print("[WebSocket 에러]:", e)
        finally:
            await audio_queue.put(None)
            stt_done.set()

    async def process_stt():
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
                        print("최종 STT 결과:", final_result)
                        await websocket.send(final_result)
                        return
                else:
                    if transcript != last_partial_transcript:
                        last_partial_transcript = transcript
                        print("중간 STT:", transcript)

    await asyncio.gather(receive_audio(), process_stt())
    print("STT 세션 종료")


async def main():
    server = await serve(handler, "0.0.0.0", 8000)
    print("Python WebSocket 서버 실행 중 (ws://localhost:8000)")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())