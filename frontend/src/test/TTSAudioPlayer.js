import React, { useEffect, useRef, useState } from 'react';

const TTSAudioPlayer = () => {
  const socketRef = useRef(null);
  const audioRef = useRef(new Audio());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // WebSocket 연결
    const socket = new WebSocket('ws://localhost:8766/');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('TTS WebSocket 연결됨');
      setConnected(true);
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'tts') {
          console.log('TTS 오디오 수신');

          const audioUrl = 'data:audio/wav;base64,' + data.data;
          const audio = audioRef.current;

          audio.src = audioUrl;

          try {
            await audio.play();
            console.log('TTS 오디오 재생 시작');
          } catch (err) {
            console.error('오디오 재생 실패:', err);
            alert('브라우저에서 오디오 자동 재생 차단');
          }

          audio.onended = () => {
            console.log('TTS 오디오 재생 완료');
          };
        }
      } catch (err) {
        console.error('메시지 처리 오류:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    socket.onclose = () => {
      console.warn('TTS WebSocket 연결 종료됨');
      setConnected(false);
    };

    // 클린업
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <p>{connected ? 'TTS 서버 연결됨' : 'TTS 서버 연결 중'}</p>
    </div>
  );
};

export default TTSAudioPlayer;
