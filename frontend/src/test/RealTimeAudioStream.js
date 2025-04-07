import React, { useRef, useState } from 'react';

const RealTimeAudioStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  let silenceTimer = useRef(null);
  const streamRef = useRef(null);

  const SILENCE_TIMEOUT_MS = 2000;

  // 스트리밍 시작
  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    console.log('마이크 스트림 가져오기 성공');

    // WebSocket 연결
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      socketRef.current = new WebSocket('ws://localhost:8765');
      socketRef.current.binaryType = 'arraybuffer';

      socketRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "tts") {
          console.log("[TTS 응답 수신]", msg.data);
          playAudioAndRestartSTT(msg.data);
        } else if (msg.type === "stt") {
          const prefix = msg.is_final ? "[최종 결과]" : "[중간 결과]";
          console.log(prefix, msg.text);
        } else if (msg.type === "error") {
          console.error("[STT 오류]", msg.message);
        }
      };
    }

    audioContextRef.current = new AudioContext();
    await audioContextRef.current.audioWorklet.addModule('/worklet-processor.js');

    const source = audioContextRef.current.createMediaStreamSource(stream);
    workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm-processor');

    // WebSocket으로 전송하는 핸들러
    workletNodeRef.current.port.onmessage = (event) => {
      const { type, silent, buffer } = event.data;

      if (type === "silence") {
        if (silent && isStreaming) {
          if (!silenceTimer.current) {
            silenceTimer.current = setTimeout(() => {
              console.log("무음 감지로 STT 종료 신호 전송");
              stopStreaming();
            }, SILENCE_TIMEOUT_MS);
          }
        } else {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      }

      if (type === "audio" && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(buffer);
        console.log("오디오 전송 중:", buffer.byteLength);
      }
    };
    
    source.connect(workletNodeRef.current).connect(audioContextRef.current.destination);
    setIsStreaming(true);
    console.log('실시간 음성 스트리밍 시작');
  };

  // 스트리밍 종료
  const stopStreaming = () => {
    setIsStreaming(false);
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close();

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'end' }));
    }

    console.log('스트리밍 종료');
  };

  // 스트리밍 다시 시작
  const playAudioAndRestartSTT = (base64Audio) => {
    const audio = new Audio("data:audio/wav;base64," + base64Audio);
    audio.play();
    audio.onended = () => {
      console.log("TTS 재생 완료 → STT 재시작");
      startStreaming();
    };
  };
  
  const handleManualToggle = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  return (
    <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
      <button onClick={handleManualToggle}>
        {isStreaming ? '스트리밍 종료' : '스트리밍 시작'}
      </button>
    </div>
  );
};

export default RealTimeAudioStream;
