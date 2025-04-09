import React, { useRef, useState } from 'react';

const RealTimeAudioStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimer = useRef(null);

  const SILENCE_TIMEOUT_MS = 2000;

  const connectWebSocket = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      socketRef.current = new WebSocket('ws://localhost:8765');
      socketRef.current.binaryType = 'arraybuffer';

      socketRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'stt') {
          const prefix = msg.is_final ? '[최종 결과]' : '[중간 결과]';
          console.log(prefix, msg.text);

          if (msg.is_final) {
            stopStreaming(); // STT 중단 (WebSocket은 유지)
          }
        } else if (msg.type === 'error') {
          console.error('[오류]', msg.message);
        }
      };
    }
  };

  const startStreaming = async () => {
    if (!streamRef.current) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }

    if (
      !audioContextRef.current ||
      audioContextRef.current.state === 'closed'
    ) {
      audioContextRef.current = new AudioContext();
      await audioContextRef.current.audioWorklet.addModule(
        '/worklet-processor.js'
      );
    }

    const source = audioContextRef.current.createMediaStreamSource(
      streamRef.current
    );
    workletNodeRef.current = new AudioWorkletNode(
      audioContextRef.current,
      'pcm-processor'
    );

    let totalSentBytes = 0;
    let startTime = Date.now(); // 전송 시작 시간 기록

    workletNodeRef.current.port.onmessage = (event) => {
      const { type, silent, buffer } = event.data;

      if (type === 'audio' && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(buffer);
        totalSentBytes += buffer.byteLength; // 누적 오디오 크기
        console.log('오디오 전송 중:', buffer.byteLength);
      }

      if (type === 'silence') {
        const elapsedMs = Date.now() - startTime;

        // 최소 조건: 1초 이상 + 최소 8192 byte 이상 전송된 경우에만 종료 허용
        const isEnoughAudio = elapsedMs > 1000 && totalSentBytes > 8192;

        if (silent && isStreaming && isEnoughAudio) {
          if (!silenceTimer.current) {
            silenceTimer.current = setTimeout(() => {
              console.log('무음 감지로 STT 종료 신호 전송');
              stopStreaming();
            }, SILENCE_TIMEOUT_MS); // 기본 2초
          }
        } else {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      }
    };

    source
      .connect(workletNodeRef.current)
      .connect(audioContextRef.current.destination);
    setIsStreaming(true);
    console.log('STT 세션 시작');
  };

  const stopStreaming = () => {
    if (workletNodeRef.current) workletNodeRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsStreaming(false);
    console.log('STT 세션 종료');
  };

  const handleToggle = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }

    if (!isStreaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
  };

  return (
    <div>
      <button onClick={handleToggle}>
        {isStreaming ? 'STT 중단' : 'STT 시작'}
      </button>
    </div>
  );
};

export default RealTimeAudioStream;
