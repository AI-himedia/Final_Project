from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from stt.audio_chat_stt import run_stt
from api.response_generator import ChatRequest, generate_response
from tts.audio_message_tts import run_tts
import base64



audio_chat_router = APIRouter()

@audio_chat_router.post("/ai/api/process-audio")
async def process_audio(subscriptionCode: int = Form(...), audio: UploadFile = File(...)):
    
    try:
        # 1. 오디오 수신
        audio_bytes = await audio.read()

        # 2. STT
        transcript = run_stt(audio_bytes)
        print(transcript)

        # 3. LLM
        chat_input = ChatRequest(subscriptionCode=subscriptionCode, userInput=transcript, serviceType="call")
        llm_response = generate_response(chat_input)
        reply = llm_response["message"]
        
        # 4. TTS
        tts_audio_bytes = run_tts(reply, subscriptionCode)

        # 5. 결과 응답 보내기
        return {
            "text": reply,
            "audio": base64.b64encode(tts_audio_bytes).decode("utf-8")
        }

    except Exception as e:
        print("[PROCESS AUDIO 오류 발생]:", e)  
        return JSONResponse(status_code=500, content={"error": str(e)})
