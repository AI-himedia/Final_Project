import { useRef } from "react";

const AudioSender = () => {
//     const [isStreaming, setIsStreaming] = useState(false);
    // const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const silenceStartRef = useRef(null);
  const SILENCE_TIMEOUT_MS = 2000

    // const webSocketUrl = "ws://localhost:8080/be/ws/react"

    // const startAudio = async () => {
    //     socketRef.current = new WebSocket(webSocketUrl);
    //     socketRef.current.binaryType = "arraybuffer";

    //     socketRef.current.onopen = async () => {
    //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //         audioContextRef.current = new AudioContext({ sampleRate: 16000 });

    //         await audioContextRef.current.audioWorklet.addModule("/worklet-processor.js");
    //         workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
        
    //         const source = audioContextRef.current.createMediaStreamSource(stream);
    //         source.connect(workletNodeRef.current);
    //         workletNodeRef.current.connect(audioContextRef.current.destination);

    //         let totalSentBytes = 0;

    //         workletNodeRef.current.port.onmessage = (event) => {
    //             const { type, silent, buffer } = event.data;

    //             if (type === "audio" && socketRef.current?.readyState === WebSocket.OPEN) {
    //                 const byteView = new Uint8Array(buffer);
    //                 socketRef.current.send(byteView);
    //                 totalSentBytes += buffer.byteLength;
    //             }
    //         };

    //         streamRef.current = stream;
    //         setIsStreaming(true);
    //     };
    // };

    // const stopAudio = async () => {
    //     if (workletNodeRef.current) workletNodeRef.current.disconnect();
    //     if (audioContextRef.current) await audioContextRef.current.close();
    //     if (streamRef.current) {
    //       streamRef.current.getTracks().forEach((track) => track.stop());
    //     }
    //     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    //       socketRef.current.close();
    //     }
    
    //     setIsStreaming(false);
    //     console.log("오디오 스트리밍 종료됨");
    // };
    
    // return (
    //     <div>
    //       {isStreaming ? (
    //         <button onClick={stopAudio}>Stop</button>
    //       ) : (
    //         <button onClick={startAudio}>Start</button>
    //       )}
    //     </div>
    // );

  const startAudioCapture = async (socketRef, isTTSPlaying) => {
    // 마이크 접근 권한 요청
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true
      }
    });
    
    // 오디오 가공처리 
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    await audioContextRef.current.audioWorklet.addModule("/worklet-processor.js");

    workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(workletNodeRef.current);

    // 오디오 전송
    workletNodeRef.current.port.onmessage = (event) => {
      const { type, silent, buffer } = event.data;

      if (type === "silence") {
        if (silent && !silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else if (!silent) {
          silenceStartRef.current = null;
        }
    
        // 2초 이상 무음 지속 → STT 종료 요청
        if ( silenceStartRef.current && Date.now() - silenceStartRef.current > SILENCE_TIMEOUT_MS) {
          console.log("[React] 무음 감지: 마이크 자동 종료");
          socketRef.current.send(JSON.stringify({ event: "end" }));
          silenceStartRef.current = null;
        }
      }

      if (type === "audio" && socketRef.current?.readyState === WebSocket.OPEN && !isTTSPlaying) {
        socketRef.current.send(new Uint8Array(buffer));
      }
    };

    streamRef.current = stream;
  };

  const stopAudioCapture = async () => {
    if (workletNodeRef.current) workletNodeRef.current.disconnect();
    if (audioContextRef.current) await audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  };

  return { startAudioCapture, stopAudioCapture };
};

export default AudioSender;
