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
  const readyToStream = useRef(false);

  const SILENCE_TIMEOUT_MS = 2000;

  const connectWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8765');
    socketRef.current.binaryType = 'arraybuffer';

    socketRef.current.onopen = () => {
      console.log('[DEBUG] WebSocket 연결됨');
      socketRef.current.send(JSON.stringify({ event: 'ready' }));
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'ready' }));
    }

    socketRef.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.event === 'ready') {
        console.log('[DEBUG] 서버 준비 완료 - 오디오 전송 시작');
        readyToStream.current = true;
        startStreaming();
        return;
      }

      if (msg.type === 'tts') {
        console.log('[DEBUG] TTS 수신');

        // if (audioContextRef.current && audioContextRef.current.state === 'running') {
        //   await audioContextRef.current.close();
        //   console.log('AudioContext 일시 종료됨');
        // }

        // const audioUrl = 'data:audio/wav;base64,' + msg.data;
        // const audio = audioRef.current;
        // audio.src = audioUrl;

        // try {
        //   await audio.play();
        //   console.log('TTS 오디오 재생 시작');
        // } catch (err) {
        //   console.error('오디오 재생 실패:', err);
        //   alert('브라우저에서 오디오 자동 재생 차단');
        //   setManualPlayRequired(true);
        // }

        // audio.onended = () => {
        //   console.log('TTS 재생 완료. STT 재시작');
        //   socketRef.current?.send(JSON.stringify({ event: 'ready' }));
        // };

        const binaryString = atob(msg.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = audioRef.current;
        audio.src = url;

        try {
          await audio.play();
          console.log('TTS 오디오 재생 시작');
        } catch (err) {
          console.error('오디오 재생 실패:', err);
          alert('브라우저에서 오디오 자동 재생 차단');
          setManualPlayRequired(true);
        }

        audio.onended = () => {
          console.log('TTS 재생 완료. STT 재시작');
          URL.revokeObjectURL(url);
          socketRef.current?.send(JSON.stringify({ event: 'ready' }));
        };

        console.log(msg.data.length);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };
  };

  // 스트리밍 시작
  const startStreaming = async () => {
    if (!readyToStream.current) return;

    if (!streamRef.current) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });
    }

    if (
      !audioContextRef.current ||
      audioContextRef.current.state === 'closed'
    ) {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
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
        const isEnoughAudio = elapsed > 800 && totalSentBytes > 4096;

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

  // 스트리밍 종료
  const stopStreaming = () => {
    if (workletNodeRef.current) workletNodeRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsStreaming(false);
    readyToStream.current = false;
    socketRef.current?.send(JSON.stringify({ event: 'end' }));
    console.log('STT 세션 종료');
  };

  const handleToggleCall = async () => {
    if (!isStreaming) {
      connectWebSocket();
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ event: 'ready' }));
        }
      }, 500);
    } else {
      stopStreaming();
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
        console.log('WebSocket 연결 종료됨');
      }
      setIsStreaming(false);
    }
  };

  // 수동재생 버튼
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
      <audio ref={audioRef} hidden preload="auto" />
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
