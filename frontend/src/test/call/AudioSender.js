import { useRef } from "react";

const AudioSender = () => {
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const silenceStartRef = useRef(null);
  const SILENCE_TIMEOUT_MS = 2000
  const endSentRef = useRef(false);

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
      console.log(`endSentRef 상태 확인: ${endSentRef.current}`);

      if (type === "silence") {
        if (silent && !silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          console.log("사용자 말 끝남")
        } else if (!silent) {
          console.log("사용자 말하는 중")
        }
    
        // 2초 이상 무음 지속 → STT 종료 요청
        if ( silenceStartRef.current && Date.now() - silenceStartRef.current > SILENCE_TIMEOUT_MS) {
          console.log("[React] 무음 감지: 마이크 자동 종료");
          socketRef.current.send(JSON.stringify({ event: "end" }));
          silenceStartRef.current = null;
        }
      }

      // if (type === "silence") {
      //   const now = Date.now();

      //   if (silent) {
      //     if (!silenceStartRef.current) {
      //       console.log(`endSentRef 상태 확인1: ${endSentRef.current}`);
      //       silenceStartRef.current = now;
      //       console.log(`무음 시작 시점: ${new Date(now).toLocaleTimeString()}`);
      //     }

      //     const duration = now - silenceStartRef.current;
      //     console.log(`무음 지속 시간: ${duration}ms`);
      //     console.log(`endSentRef 상태 확인2: ${endSentRef.current}`);

      //     // 무음 시간이 충분히 지나고 아직 end 전송 안 했으면
      //     if (duration > SILENCE_TIMEOUT_MS && !endSentRef.current) {
      //       console.log(`무음 ${duration}ms 지속됨 → end 전송 at ${new Date(now).toLocaleTimeString()}`);
      //       console.log("[React] end 메시지 보내기 직전 상태:", {
      //         readyState: socketRef.current?.readyState,
      //         endSent: endSentRef.current,
      //         silenceStart: silenceStartRef.current,
      //         duration
      //       });
          
      //       endSentRef.current = true;
      //       socketRef.current.send(JSON.stringify({ event: "end" }));
      //       silenceStartRef.current = null;
      //     }
      //   } else {
      //     const duration = silenceStartRef.current ? now - silenceStartRef.current : 0;
      //     console.log(`endSentRef 상태 확인4: ${endSentRef.current}`);
      //     if (Date.now() - silenceStartRef.current < 200) {
      //         console.log(`짧은 소리 감지 (${duration}ms) → 무시`);
      //         return;
      //     }
            
      //     console.log(`사용자 발화 시작 at ${new Date(now).toLocaleTimeString()} (무음 지속: ${duration}ms)`);
      //     silenceStartRef.current = null;
      //     endSentRef.current = false;
      //   }
      // }

      if (type === "audio" && socketRef.current?.readyState === WebSocket.OPEN && !isTTSPlaying) {
        socketRef.current.send(new Uint8Array(buffer));
      }
    };

    streamRef.current = stream;
  };

  // const stopAudioCapture = async () => {
  //   if (workletNodeRef.current) workletNodeRef.current.disconnect();
  //   if (audioContextRef.current) await audioContextRef.current.close();
  //   if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  // };

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
