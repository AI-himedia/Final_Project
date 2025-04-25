import { useRef } from "react";

const AudioSender = () => {
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const silenceStartRef = useRef(null);
  const endSentRef = useRef(null);

  const startAudioCapture = async (socketRef, isTTSPlaying) => {
    silenceStartRef.current = null;
    endSentRef.current = false;

    if (!audioContextRef.current || audioContextRef.current.state === "closed") {

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
    
    // WorkletNode 생성
    workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
    
    // 초기화 이후에 무음 타이머 리셋
    workletNodeRef.current.port.postMessage({ type: "resetSilenceTimer" });

    // 연결
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(workletNodeRef.current);
    
    // 메시지 수신 처리
    workletNodeRef.current.port.onmessage = (event) => {
      const { type, buffer } = event.data;
    
      if (type === "autoEnd") {
        console.log("무음 감지됨 → end 이벤트 서버 전송");
        socketRef.current.send(JSON.stringify({ event: "end" }));
        return;
      }

      // audio 처리
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
