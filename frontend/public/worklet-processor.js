// let lastSilent = false;

// class PCMProcessor extends AudioWorkletProcessor {

//   process(inputs) {
//     const input = inputs[0];

//     if (input.length > 0) {
//       const channelData = input[0];
    
//       // 1. 무음 감지
//       const avg = channelData.reduce((sum, val) => sum + Math.abs(val), 0) / channelData.length;
//       const isSilent = avg < 0.0;

//       // 상태 변경 시 무음 여부 포스트
//       if (isSilent !== lastSilent) {
//         this.port.postMessage({ type: "silence", silent: isSilent });
//         lastSilent = isSilent;
//       }
    
//       // 2. Float32 → Int16 PCM 변환
//       const int16Buffer = new Int16Array(channelData.length);
//       for (let i = 0; i < channelData.length; i++) {
//         int16Buffer[i] = Math.round(Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF);
//       }

//       // 3. 서버로 전송
//       this.port.postMessage(
//         { type: "audio", buffer: int16Buffer.buffer },
//         [int16Buffer.buffer]
//       );
//     }
//     return true;
//   }
// }
  
// registerProcessor('pcm-processor', PCMProcessor);


const silenceThreshold = 0.05;            // 진폭 기준
const silenceRequiredFrames = 16000 ;  // 1초 (16kHz)
let silenceStartFrame = null;
let frameCount = 0;

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (e) => {
      if (e.data?.type === "resetSilenceTimer") {
        silenceStartFrame = null;
        console.log("silence 타이머 수동 리셋됨");
      }
    };
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channelData = input[0];

    const avg = channelData.reduce((sum, val) => sum + Math.abs(val), 0) / channelData.length;
    const isSilent = avg < silenceThreshold;

    const currentFrame = frameCount;
    frameCount += channelData.length;
  
    if (isSilent) {
      if (silenceStartFrame === null) {
        silenceStartFrame = currentFrame;
        this.port.postMessage({
          type: "log",
          message: `[무음 시작] frame=${currentFrame}`
        });
      } else {
        const silenceDuration = currentFrame - silenceStartFrame;
        this.port.postMessage({
          type: "log",
          message: `[무음 지속 중] frame=${currentFrame}, 지속=${silenceDuration}`
        });
    
        if (silenceDuration > silenceRequiredFrames) {
          this.port.postMessage({ type: "autoEnd" });
          silenceStartFrame = null;
          this.port.postMessage({
            type: "log",
            message: `[autoEnd 전송] frame=${currentFrame}`
          });
        }
      }
    } else {
      if (silenceStartFrame !== null) {
        this.port.postMessage({
          type: "log",
          message: `[발화 시작] 무음 타이머 리셋됨 (기존 시작 frame=${silenceStartFrame})`
        });
      }
      silenceStartFrame = null;
    }
    
     // audio buffer 전송
    const int16Buffer = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      int16Buffer[i] = Math.round(Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF);
    }

    this.port.postMessage(
      { type: "audio", buffer: int16Buffer.buffer },
      [int16Buffer.buffer]
    );

    return true;
  }
};
  
registerProcessor('pcm-processor', PCMProcessor);