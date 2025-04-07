import React, { useRef, useState } from 'react';

const RealTimeAudioStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  let silenceTimer = useRef(null);

  const SILENCE_TIMEOUT_MS = 2000;

  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('마이크 스트림 가져오기 성공');

    // WebSocket 연결
    socketRef.current = new WebSocket('ws://localhost:8765');
    socketRef.current.binaryType = 'arraybuffer';

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "tts") {
        playAudioAndRestartSTT(msg.data);
      }
    };

    audioContextRef.current = new AudioContext();
    await audioContextRef.current.audioWorklet.addModule('/worklet-processor.js');

    const source = audioContextRef.current.createMediaStreamSource(stream);
    workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm-processor');

    // WebSocket으로 전송하는 핸들러
    workletNodeRef.current.port.onmessage = (event) => {
      const { type, silent, buffer } = event.data;

      if (type === "silence") {
        if (silent) {
          if (!silenceTimer.current) {
            silenceTimer.current = setTimeout(() => {
              console.log("무음 감지로 자동 종료");
              stopStreaming();  // 자동 종료
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

  const stopStreaming = () => {
    setIsStreaming(false);
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close();

    setTimeout(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ event: 'end' }));
        socketRef.current.close();
      }
    }, 1000);

    console.log('스트리밍 종료');
  };

  const playAudioAndRestartSTT = (base64Audio) => {
    const audio = new Audio("data:audio/wav;base64," + base64Audio);
    audio.play();
    audio.onended = () => {
      startStreaming(); // 다시 시작
    };
  };
  

  return (
    <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
      <button onClick={isStreaming ? stopStreaming : startStreaming}>
        {isStreaming ? '스트리밍 종료' : '스트리밍 시작'}
      </button>
    </div>
  );
  
};

export default RealTimeAudioStream;
