import React, { useRef, useState, useEffect } from "react";
import AudioSender from "./AudioSender";
import { setupMediaSource } from "./TTSStreamPlayer"



const CallService = () => {
  const { startAudioCapture, stopAudioCapture } = AudioSender();
  const [isCalling, setIsCalling] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [manualPlayRequired, setManualPlayRequired] = useState(false);

  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const receivedChunksRef = useRef(null);

  const micStartTimeRef = useRef(null);

  const webSocketUrl = "ws://localhost:8080/be/ws/react";
  


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        console.log("오디오 재생 완료됨");
        setIsTTSPlaying(false);
        
        setTimeout(() => {
          console.log("발화 재시작");
          startAudioCapture(socketRef, false);
        }, 500);
      };
    }
  }, []);



  const startCall = async () => {
    socketRef.current = new WebSocket(webSocketUrl);
    socketRef.current.binaryType = "arraybuffer";
    
    micStartTimeRef.current = performance.now();
    startAudioCapture(socketRef, false);

    // WebSocket 수신 처리
    socketRef.current.onmessage = async (event) => {
      console.log("[React 수신 원본]:", event.data);

      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "stt_start") {
          console.log("마이크 중단");
          
          await stopAudioCapture();
          setIsTTSPlaying(true);

          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
          
          receivedChunksRef.current = [];

        } else if(msg.type === "tts_end") {
          console.log("TTS 수신 완료.  재생 시작");
          
          const totalBytes = receivedChunksRef.current.reduce((sum, buf) => sum + buf.byteLength, 0);
          console.log("[오디오 저장] 총 바이트 수:", totalBytes);

          const blob = new Blob(receivedChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          if (audioRef.current) {
            const now = performance.now();
            const elapsed = (now - micStartTimeRef.current).toFixed(2);
            console.log(`[타이밍 측정] 마이크 입력 후 오디오 재생까지 소요 시간: ${elapsed}ms`);

            audioRef.current.src = url;
            audioRef.current.play()
              .then(() => console.log("[재생] 오디오 재생 시작됨 (blob 방식)"))
              .catch((e) => {
                console.warn("[재생 실패] → 수동 재생 필요:", e);
                setManualPlayRequired(true);
              });
          }
        }
      } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        const buffer = event.data instanceof Blob ? await event.data.arrayBuffer() : event.data;
        receivedChunksRef.current.push(buffer);
        console.log(`[React] chunk 수신됨 - ${buffer.byteLength} bytes`);
      }
    };
    setIsCalling(true);
  };


  // 통화 종료 - 마이크/AudioContext 정지, WebSocket 닫기
  const endCall = async () => {
    await stopAudioCapture();
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    setIsCalling(false);
  };

  const handleToggleCall = () => {
    if (!isCalling) {
      startCall();
    } else {
      endCall();
    }
  };

  // 수동 재생 버튼
  const handleManualPlay = async () => {
    try {
      await audioRef.current?.play();
      setManualPlayRequired(false); // 성공 시 버튼 숨김
      console.log("수동 재생 성공");
    } catch (err) {
      console.error("수동 재생도 실패:", err);
    }
  };
  

  return (
    <div>
      <h2>전화 서비스</h2>
      <button onClick={handleToggleCall}>
        {isCalling ? "통화 종료" : "통화 시작"}
      </button>
      <audio ref={audioRef} autoPlay />
      {manualPlayRequired && (
        <div>
          <p>브라우저 정책으로 인해 자동 재생이 차단되었습니다.</p>
          <button onClick={handleManualPlay}>
            오디오 수동 재생
          </button>
        </div>
      )}
    </div>
  );
};

export default CallService;