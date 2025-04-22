// import { useEffect, useRef } from 'react';

// const TTSStreamPlayer = () => {
//   const audioRef = useRef(null);
//   const mediaSourceRef = useRef(null);
//   const sourceBufferRef = useRef(null);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     mediaSourceRef.current = new MediaSource();

//     // Audio 요소에 연결
//     audioRef.current.src = URL.createObjectURL(mediaSourceRef.current);

//     mediaSourceRef.current.addEventListener("sourceopen", () => {
//       const mime = 'audio/wav; codecs=1'; // WAV (PCM) 기본 지원 MIME
//       sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(mime);
//       console.log("MediaSource 연결됨");

//       connectWebSocket(); // WebSocket 연결
//     });
//   }, []);

//   const connectWebSocket = () => {
//     socketRef.current = new WebSocket("ws://localhost:8080/be/ws/react");
//     socketRef.current.binaryType = "arraybuffer"; // binary chunk 받을 준비

//     socketRef.current.onopen = () => {
//       console.log("WebSocket 연결됨");
//     };

//     socketRef.current.onmessage = (event) => {
//       if (typeof event.data === "string") {
//         const msg = JSON.parse(event.data);
//         if (msg.type === "tts_start") {
//           console.log("TTS 스트리밍 시작");
//         } else if (msg.type === "tts_end") {
//           console.log("TTS 스트리밍 종료");
//           mediaSourceRef.current.endOfStream();
//         }
//       } else {
//         // Binary chunk 수신 (ArrayBuffer)
//         if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
//           sourceBufferRef.current.appendBuffer(event.data);
//         }
//       }
//     };
//   };
// };

// export default TTSStreamPlayer;

const setupMediaSource = (audioRef, onTTSStart, onTTSEnd) => {
  const mediaSource = new MediaSource();
  const sourceBufferRef = { current: null };

  audioRef.current.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener("sourceopen", () => {
    try {
      // WebM + Opus 포맷용 SourceBuffer 생성
      sourceBufferRef.current = mediaSource.addSourceBuffer("audio/webm; codecs=opus");
      onTTSStart(sourceBufferRef);
    } catch (e) {
      console.error("SourceBuffer 생성 오류:", e);
    }
  });

  mediaSource.addEventListener("sourceended", () => {
    console.log("MediaSource 재생 종료됨");
    if (onTTSEnd) onTTSEnd();
  });
  
  return sourceBufferRef;
};
  
export { setupMediaSource };
