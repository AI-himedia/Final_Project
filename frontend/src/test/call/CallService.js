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
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const appendQueueRef = useRef([]);

  const micStartTimeRef = useRef(null);

  const webSocketUrl = "ws://localhost:8080/be/ws/react";
  
  
  const initMediaSource = () => {
    setupMediaSource(audioRef, (sourceBufferRefFromSetup, mediaSource) => {
      sourceBufferRef.current = sourceBufferRefFromSetup.current;
      mediaSourceRef.current = mediaSource;
  
      const tryAppendBuffer = () => {
        console.log("[SourceBuffer] 생성됨:", mediaSource.readyState);

        const queue = appendQueueRef.current;
        if (!sourceBufferRef.current || !mediaSourceRef.current ||
            mediaSourceRef.current.readyState !== "open" ||
            sourceBufferRef.current.updating) return;

        if (queue.length > 0) {
          const nextBuffer = queue.shift();
          try {
            sourceBufferRef.current.appendBuffer(nextBuffer);
          } catch (e) {
            console.warn("appendBuffer 실패:", e);
          }
        }
      };

  
      sourceBufferRef.current.addEventListener("updateend", () => {
        console.log("[updateend] 이벤트 발생");
        tryAppendBuffer();
  
        const queue = appendQueueRef.current;
        if (queue.length === 0 && !sourceBufferRef.current.updating) {
          console.log("재생 직전 상태 확인");
          console.log("audio.readyState:", audioRef.current.readyState);
          console.log("mediaSource.readyState:", mediaSourceRef.current?.readyState);
          console.log("sourceBuffer.updating:", sourceBufferRef.current?.updating);
  
          setTimeout(() => {
            console.log("[React] 재생 시도 직전 readyState:", audioRef.current.readyState);

            if (audioRef.current.readyState === 0) {
              console.warn("[재생 실패] 오디오 준비 안 됨");
              setManualPlayRequired(true);
              return;
            }
            audioRef.current.onplay = () => {
              const now = performance.now();
              const elapsed = (now - micStartTimeRef.current).toFixed(2);
              console.log(`[재생 시점] 실제 재생까지 소요 시간: ${elapsed}ms`);
            };
            audioRef.current.play().catch((e) => {
                console.warn("[재생] 자동 재생 실패 → 수동 필요:", e);
                setManualPlayRequired(true);
            });
          }, 50);
        }
      });
  
      sourceBufferRef.current.addEventListener("error", (e) =>
        console.error("SourceBuffer 에러 발생:", e)
      );
    });
  };
  

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        console.log("오디오 재생 완료됨");
        setIsTTSPlaying(false);
        
        // setTimeout(() => {
        //   console.log("발화 재시작");
        //   startAudioCapture(socketRef, false);
        // }, 500);
      };
    }
  }, [audioRef.current]);


  const startCall = async () => {
    socketRef.current = new WebSocket(webSocketUrl);
    socketRef.current.binaryType = "arraybuffer";
    
    // TTS 실행 -> 사용자 Audio 다시 받기
    initMediaSource();
    micStartTimeRef.current = performance.now();
    startAudioCapture(socketRef, false);

    
    // WebSocket 수신 처리
    socketRef.current.onmessage = async (event) => {
      console.log("[React 수신 원본]:", event.data);

      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "stt_end") {
          console.log("마이크 중단");
          
          await stopAudioCapture();
          setIsTTSPlaying(true);

          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
          appendQueueRef.current = [];
          
          initMediaSource();
          
        } else if(msg.type === "tts_end") {
          console.log("TTS 수신 완료. 마이크 오픈");
          setTimeout(() => {
            console.log("발화 재시작");
            startAudioCapture(socketRef, false);
          }, 500);
        }
      }else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {

        const buffer = event.data instanceof Blob ? await event.data.arrayBuffer() : event.data;
        const queue = appendQueueRef.current;
        queue.push(buffer);
    
        if (
          sourceBufferRef.current &&
          mediaSourceRef.current &&
          mediaSourceRef.current.readyState === "open" &&
          !sourceBufferRef.current.updating
        ) {
          const nextBuffer = queue.shift();
          if (nextBuffer) {
            try {
              sourceBufferRef.current.appendBuffer(nextBuffer);
              console.log("[React] appendBuffer 실행됨, 크기:", nextBuffer.byteLength);
            } catch (e) {
              console.warn("appendBuffer 에러 발생:", e);
            }
          }
        }
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