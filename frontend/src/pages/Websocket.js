import React, { useRef, useState } from 'react';

const RealTimeAudioStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);

  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContextRef.current = new AudioContext();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    // WebSocket 연결
    socketRef.current = new WebSocket('ws://localhost:8765');
    socketRef.current.binaryType = 'arraybuffer';

    // 오디오 처리
    processorRef.current.onaudioprocess = (e) => {
      if (!isStreaming) return;

      const input = e.inputBuffer.getChannelData(0); // float32 PCM
      const int16Buffer = convertFloat32ToInt16(input);

      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(int16Buffer);
      }
    };

    // Audio 처리 파이프 연결
    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);

    setIsStreaming(true);
    console.log('실시간 음성 스트리밍 시작');
  };

  const stopStreaming = () => {
    setIsStreaming(false);

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'end' }));
      socketRef.current.close();
    }

    console.log('스트리밍 종료');
  };

  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const int16Buffer = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16Buffer[i] = Math.min(1, buffer[i]) * 0x7FFF;
    }
    return int16Buffer.buffer;
  };

  return (
    <div>
      <button onClick={isStreaming ? stopStreaming : startStreaming}>
        {isStreaming ? '스트리밍 종료' : '스트리밍 시작'}
      </button>
    </div>
  );
};

export default RealTimeAudioStream;
