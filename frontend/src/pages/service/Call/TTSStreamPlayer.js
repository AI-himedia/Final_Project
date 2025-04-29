// export function setupMediaSource(audioRef, onSourceBufferReady) {
//   const mime = 'audio/webm; codecs="opus"';
//   if (!MediaSource.isTypeSupported(mime)) {
//     console.error('브라우저가 audio/webm; codecs=opus 지원 안 함');
//   } else {
//     console.log('브라우저가 audio/webm; codecs=opus 지원');
//   }
//   const mediaSource = new MediaSource();
//   const url = URL.createObjectURL(mediaSource);
//   audioRef.current.src = url;
//   audioRef.current.load();
//   mediaSource.addEventListener('sourceopen', () => {
//     console.log('[setupMediaSource] sourceopen 이벤트 발생');
//     if (mediaSource.sourceBuffers.length > 0) {
//       console.warn('이미 SourceBuffer 있음 → 중복 생성 방지');
//       return;
//     }
//     const sourceBuffer = mediaSource.addSourceBuffer(mime);
//     onSourceBufferReady({ current: sourceBuffer }, mediaSource);
//   });
// }

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
