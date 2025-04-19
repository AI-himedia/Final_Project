import { useRef } from "react";

const AudioSender = () => {
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const silenceStartRef = useRef(null);
  const SILENCE_TIMEOUT_MS = 2000

  const startAudioCapture = async (socketRef, isTTSPlaying) => {

    if (!audioContextRef.current || audioContextRef.current.state === "closed"
    ) {

      if (audioContextRef.current?.state === "closed") {
        audioContextRef.current = null;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
        await audioContextRef.current.audioWorklet.addModule("/worklet-processor.js");
      }
    }

    // 마이크 접근 권한 요청
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true
      }
    });
    
    // 오디오 가공처리 
    workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(workletNodeRef.current);

    // 오디오 전송
    workletNodeRef.current.port.onmessage = (event) => {
      const { type, silent, buffer } = event.data;

      if (type === "silence") {
        if (silent && !silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          console.log("사용자 말 끝남")
        } else if (!silent) {
          console.log("사용자 말하는 중")
        }
    
        // 2초 이상 무음 지속 → STT 종료 요청
        if ( silenceStartRef.current && Date.now() - silenceStartRef.current > SILENCE_TIMEOUT_MS) {
          console.log("무음 감지: 마이크 자동 종료");
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
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed"
    ) {
      try {
        await audioContextRef.current.close();
        console.log("AudioContext 닫힘");
        console.log("닫은 후 상태:", audioContextRef.current.state);
      } catch (e) {
        console.warn("AudioContext 닫기 실패:", e);
      }
    } else {
      console.log("AudioContext는 이미 닫혀 있음");
    }
  };

  return { startAudioCapture, stopAudioCapture };
};

export default AudioSender;