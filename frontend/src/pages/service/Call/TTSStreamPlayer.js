// const setupMediaSource = (audioRef, onTTSStart, onTTSEnd) => {
//   const mediaSource = new MediaSource();
//   const sourceBufferRef = { current: null };

//   audioRef.current.src = URL.createObjectURL(mediaSource);

//   mediaSource.addEventListener("sourceopen", () => {
//     try {
//       // WebM + Opus 포맷용 SourceBuffer 생성
//       sourceBufferRef.current = mediaSource.addSourceBuffer("audio/webm; codecs=opus");
//       onTTSStart(sourceBufferRef);
//     } catch (e) {
//       console.error("SourceBuffer 생성 오류:", e);
//     }
//   });

//   mediaSource.addEventListener("sourceended", () => {
//     console.log("MediaSource 재생 종료됨");
//     if (onTTSEnd) onTTSEnd();
//   });

//   return sourceBufferRef;
// };

// export { setupMediaSource };

export function setupMediaSource(audioRef, onSourceBufferReady) {
  const mime = 'audio/webm; codecs="opus"';
  if (!MediaSource.isTypeSupported(mime)) {
    console.error('브라우저가 audio/webm; codecs=opus 지원 안 함');
  } else {
    console.log('브라우저가 audio/webm; codecs=opus 지원');
  }

  const mediaSource = new MediaSource();
  const url = URL.createObjectURL(mediaSource);
  audioRef.current.src = url;
  audioRef.current.load();

  mediaSource.addEventListener('sourceopen', () => {
    console.log('[setupMediaSource] sourceopen 이벤트 발생');

    if (mediaSource.sourceBuffers.length > 0) {
      console.warn('이미 SourceBuffer 있음 → 중복 생성 방지');
      return;
    }

    const sourceBuffer = mediaSource.addSourceBuffer(mime);
    onSourceBufferReady({ current: sourceBuffer }, mediaSource);
  });
}
