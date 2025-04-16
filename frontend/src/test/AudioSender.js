import React, { useEffect, useRef, useState } from "react";

const AudioSender = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const socketRef = useRef(null);
    const audioContextRef = useRef(null);
    const workletNodeRef = useRef(null);
    const streamRef = useRef(null);

    const webSocketUrl = "ws://localhost:8080/be/ws/audio"

    const startAudio = async () => {
        socketRef.current = new WebSocket(webSocketUrl);
        socketRef.current.binaryType = "arraybuffer";

        socketRef.current.onopen = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext({ sampleRate: 16000 });

            await audioContextRef.current.audioWorklet.addModule("/worklet-processor.js");
            workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
        
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(workletNodeRef.current);
            workletNodeRef.current.connect(audioContextRef.current.destination);

            let totalSentBytes = 0;

            workletNodeRef.current.port.onmessage = (event) => {
                const { type, silent, buffer } = event.data;

                if (type === "audio" && socketRef.current?.readyState === WebSocket.OPEN) {
                    console.log("buffer 타입:", buffer.constructor.name);

                    const byteView = new Uint8Array(buffer);
                    socketRef.current.send(byteView);

                    // socketRef.current.send(buffer);
                    totalSentBytes += buffer.byteLength;
                    console.log('오디오 전송:', buffer.byteLength);
                }
            };

            streamRef.current = stream;
            setIsStreaming(true);
        };
    };

    const stopAudio = async () => {
        if (workletNodeRef.current) workletNodeRef.current.disconnect();
        if (audioContextRef.current) await audioContextRef.current.close();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close();
        }
    
        setIsStreaming(false);
        console.log("오디오 스트리밍 종료됨");
    };
    
    return (
        <div>
          {isStreaming ? (
            <button onClick={stopAudio}>Stop</button>
          ) : (
            <button onClick={startAudio}>Start</button>
          )}
        </div>
    );
};

export default AudioSender;
