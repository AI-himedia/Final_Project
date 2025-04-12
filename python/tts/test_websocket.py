import base64
import json
import uuid
import queue
import threading
from websocket_server import WebsocketServer
import time

from pydantic import BaseModel
from stt_api import run_streaming_stt
from tts_test import run_tts
from api.response_generator import generate_response


# LLM 에게 전달할 데이터 형식
class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str


MIN_AUDIO_CHUNKS = 1
clients_info = {}


# 클라이언트 연결
def new_client(client, server):
    print(f"[{client['id']}] 클라이언트 연결됨")
    server.send_message(client, json.dumps({"event": "ready"}))
    clients_info[client['id']] = {
        "session_id": str(uuid.uuid4()),
        "queue": queue.Queue(),
        "received_chunks": 0,
        "audio_received": threading.Event(),
        "user_requested_disconnect": False
    }


# 클라이언트 연결 종료
def client_left(client, server):
    print(f"[{client['id']}] 클라이언트 연결 종료됨")
    clients_info.pop(client['id'], None)


# 오디오 준비
def message_received(client, server, message):
    client_id = client['id']
    info = clients_info[client_id]

    # 바이너리 메시지: 오디오 청크
    if isinstance(message, bytes):
        if info["audio_received"].is_set() is False:
            info["audio_received"].set()
        info["received_chunks"] += 1
        info["queue"].put(message)

    # 텍스트 메시지: 이벤트 제어
    else:
        try:
            data = json.loads(message)
            event_type = data.get("event")

            if event_type == "ready":
                print(f"[{info['session_id']}] 클라이언트 준비 완료")

            elif event_type == "end":
                print(f"[{info['session_id']}] 클라이언트 종료 요청")
                info["user_requested_disconnect"] = True
                info["queue"].put(None)

        except Exception as e:
            print("메시지 파싱 오류:", e)


# STT - LLM - TTS
def stt_thread_func(client, server):
    start = time.time()
    client_id = client['id']
    info = clients_info[client_id]

    print(f"[{info['session_id']}] 오디오 수신 대기 중")
    info["audio_received"].wait()
    if info["user_requested_disconnect"]:
        return

    if info["received_chunks"] < MIN_AUDIO_CHUNKS:
        print(f"[{info['session_id']}] 오디오 수신량 부족: {info['received_chunks']}")
        return

    print(f"[{info['session_id']}] STT 시작")
    seen_final_transcripts = set()

    try:
        stt_start = time.time()
        responses = run_streaming_stt(info["queue"])
        stt_end = time.time()
        print(f"STT 처리 시간: {int((stt_end - stt_start) * 1000)}ms")
        for response in responses:
            for result in response.results:
                if result.is_final:
                    transcript = result.alternatives[0].transcript.strip()
                    if transcript and transcript not in seen_final_transcripts:
                        seen_final_transcripts.add(transcript)
                        print(f"[{info['session_id']}] 최종 STT: {transcript}")

                        try:
                            llm_start = time.time()
                            chat_input = ChatRequest(subscriptionCode=300, userInput=transcript)
                            response_llm = generate_response(chat_input)
                            llm_end = time.time()
                            response_message = response_llm["message"]
                            print(f"LLM 처리 시간: {int((llm_end - llm_start) * 1000)}ms")
                            print(f"[{info['session_id']}] LLM 응답: {response_message}")

                            tts_start = time.time()
                            tts_audio = run_tts(response_message)
                            tts_end = time.time()
                            print(f"TTS 처리 시간: {int((tts_end - tts_start) * 1000)}ms")
                            server.send_message(client, json.dumps({
                                "type": "tts",
                                "data": base64.b64encode(tts_audio).decode("utf-8")
                            }))
                            print(f"[{info['session_id']}] TTS 전송 완료")
                            return
                        except Exception as e:
                            print(f"[{info['session_id']}] LLM→TTS 처리 오류:", e)
                            return
        print(f"[{info['session_id']}] STT 결과 없음")
        end = time.time()
        print(f"[{info['session_id']}] 총 처리 시간: {int((end - start) * 1000)}ms")
    except Exception as e:
        print(f"[{info['session_id']}] STT 오류:", e)


# 서버 시작
def start_server():
    server = WebsocketServer(host='0.0.0.0', port=8765, loglevel=1)

    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)

    def on_message(client, server, message):
        message_received(client, server, message)

        # STT 처리는 매번 별도 쓰레드로
        thread = threading.Thread(target=stt_thread_func, args=(client, server))
        thread.start()

    server.set_fn_message_received(on_message)
    print("동기식 WebSocket 서버 시작")
    server.run_forever()

      
if __name__ == "__main__":
    start_server()