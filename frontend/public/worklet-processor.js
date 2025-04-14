let lastSilent = false;

class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];

    if (input.length > 0) {
      const channelData = input[0];
    
      // 1. 무음 감지
      const avg = channelData.reduce((sum, val) => sum + Math.abs(val), 0) / channelData.length;
      const isSilent = avg < 0.01;

      // 상태 변경 시 무음 여부 포스트
      if (isSilent !== lastSilent) {
        this.port.postMessage({ type: "silence", silent: isSilent });
        lastSilent = isSilent;
      }
    
      // 2. Float32 → Int16 PCM 변환
      const int16Buffer = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        int16Buffer[i] = Math.round(Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF);

      }

      // 3. 서버로 전송
      this.port.postMessage(
        { type: "audio", buffer: int16Buffer.buffer },
        [int16Buffer.buffer] // zero-copy
      );
    }
    return true;
  }
}
  
registerProcessor('pcm-processor', PCMProcessor);