import React, { useRef, useState } from 'react';

const CallService = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [manualPlayRequired, setManualPlayRequired] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimer = useRef(null);
  const audioRef = useRef(new Audio());

  const SILENCE_TIMEOUT_MS = 2000;

  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8765');
    socketRef.current.binaryType = 'arraybuffer';

    socketRef.current.onopen = () => {
      console.log('WebSocket 연결됨');
    };

    socketRef.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'tts') {
        console.log('TTS 수신');
        const audio = audioRef.current;
        audio.src = 'data:audio/wav;base64,' + msg.data;

        try {
          await audio.play();
          console.log('TTS 자동 재생 시작');
        } catch (err) {
          console.warn('자동 재생 실패: ', err);
          setManualPlayRequired(true);
        }

        audio.onended = () => {
          console.log('TTS 재생 완료. STT 재시작');
          startStreaming();
        };
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };
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
    const startTime = Date.now();

    workletNodeRef.current.port.onmessage = (event) => {
      const { type, silent, buffer } = event.data;

      if (type === 'audio' && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(buffer);
        totalSentBytes += buffer.byteLength;
        console.log('오디오 전송:', buffer.byteLength);
      }

      if (type === 'silence') {
        const elapsed = Date.now() - startTime;
        const isEnoughAudio = elapsed > 1000 && totalSentBytes > 8192;

        if (silent && isStreaming && isEnoughAudio) {
          if (!silenceTimer.current) {
            silenceTimer.current = setTimeout(() => {
              console.log('무음 감지. STT 종료');
              stopStreaming();
            }, SILENCE_TIMEOUT_MS);
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
    socketRef.current?.send(JSON.stringify({ event: 'end' }));
    console.log('STT 세션 종료');
  };

  //   const handleToggleCall = async () => {
  //     if (!isStreaming) {
  //       connectWebSocket();
  //       setTimeout(() => startStreaming(), 500);
  //     } else {
  //       stopStreaming();
  //       if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
  //         socketRef.current.close();
  //         console.log("WebSocket 연결 종료됨");
  //       }
  //       setIsStreaming(false);
  //     }
  //   };

  const handleToggleCall = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }

    if (!isStreaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
  };

  const handleManualPlay = async () => {
    try {
      await audioRef.current.play();
      console.log('수동 재생 성공');
      setManualPlayRequired(false);
    } catch (err) {
      console.error('수동 재생 실패:', err);
      alert('재생에 실패했습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={handleToggleCall}>
        {isStreaming ? '통화 종료' : '통화 시작'}
      </button>

      {manualPlayRequired && (
        <div style={{ marginTop: '1rem' }}>
          <p>브라우저에서 자동 재생이 차단되었습니다.</p>
          <button onClick={handleManualPlay}>수동 재생</button>
        </div>
      )}
    </div>
  );
};

export default CallService;
