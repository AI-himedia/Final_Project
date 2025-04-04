let lastSilent = false;

class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];

    if (input.length > 0) {
      const channelData = input[0];
    
      // 1. 무음 판별
      const avg = channelData.reduce((sum, val) => sum + Math.abs(val), 0) / channelData.length;
      const isSilent = avg < 0.01;

      // 2. 실시간 무음상태 전달
      if (isSilent !== lastSilent) {
        this.port.postMessage({ type: "silence", silent: isSilent });
        lastSilent = isSilent;
      }
    
      // 3. 변환해서 전송
      const int16Buffer = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        int16Buffer[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF;
      }

      this.port.postMessage({ type: "audio", buffer: int16Buffer.buffer }, [int16Buffer.buffer]);
    }
    return true;
  }
}
  
registerProcessor('pcm-processor', PCMProcessor);
  