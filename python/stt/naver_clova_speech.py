import sys
import os
import grpc
import time
import nest_pb2
import nest_pb2_grpc
from dotenv import load_dotenv
import json
import asyncio
import binascii

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

async def run_clova_streaming_stt(audio_queue: asyncio.Queue):
    
    # 1. gRPC 채널 생성 (네이버 서버 주소 사용)
    channel = grpc.secure_channel(
        'clovaspeech-gw.ncloud.com:50051',  # 포트는 50051
        grpc.ssl_channel_credentials()
    )

    # 2. 서비스 스텁 생성
    stub = nest_pb2_grpc.NestServiceStub(channel) 
    secret_key = os.getenv("NAVER_CLOVA_SPEECH_SCREAT_KEY")

    # 3. 인증 메타데이터 설정
    metadata = (
        ("authorization", f"Bearer {secret_key}"),
    )


    # 4. 요청 스트림 생성
    def audio_chunk_generator():
        # CONFIG 먼저 전송
        yield nest_pb2.NestRequest(
            type=nest_pb2.RequestType.CONFIG,
            config=nest_pb2.NestConfig(
                config=json.dumps({
                    "transcription": {
                        "language": "ko"
                    },
                    "semanticEpd": {
                        "useWordEpd": True,
                        "usePeriodEpd": True
                    }
                })
            )
        )

        # 클라이언트에서 오는 오디오 청크를 하나하나 받아서 gRPC로 보내기
        seq_id = 1
        while True:
            try:
                chunk = audio_queue.get_nowait()
            except asyncio.QueueEmpty:
                time.sleep(0.01)
                continue

            if chunk is None:
                break
            
            print(f"[디버그] 받은 오디오 청크 (Hex dump): {binascii.hexlify(chunk[:100])}")

            yield nest_pb2.NestRequest(
                type=nest_pb2.RequestType.DATA,
                data=nest_pb2.NestData(
                    chunk=chunk,
                    extra_contents=json.dumps({
                        "seqId": seq_id,
                        "epFlag": False
                    })
                )
            )
            seq_id += 1

        # 마지막 신호 보내기 (epFlag=True)
        yield nest_pb2.NestRequest(
            type=nest_pb2.RequestType.DATA,
            data=nest_pb2.NestData(
                chunk=b"",
                extra_contents=json.dumps({
                    "seqId": seq_id,
                    "epFlag": True
                })
            )
        )

    try:
        # gRPC streaming 호출
        responses = stub.recognize(audio_chunk_generator(), metadata=metadata)
        return responses, channel
    except grpc.RpcError as e:
        print(f"gRPC 통신 오류: {e.details()}")
        return None, None
