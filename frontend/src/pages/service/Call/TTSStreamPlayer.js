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

// export function setupMediaSource(audioRef, onSourceBufferReady) {
//   const mime = 'audio/webm; codecs="opus"';
//   if (!MediaSource.isTypeSupported(mime)) {
//     console.error("브라우저가 audio/webm; codecs=opus 지원 안 함");
//   } else {
//     console.log("브라우저가 audio/webm; codecs=opus 지원");
//   }

//   const mediaSource = new MediaSource();
//   const url = URL.createObjectURL(mediaSource);
//   audioRef.current.src = url;
//   audioRef.current.load();

//   mediaSource.addEventListener("sourceopen", () => {
//     console.log("[setupMediaSource] sourceopen 이벤트 발생");

//     if (mediaSource.sourceBuffers.length > 0) {
//       console.warn("이미 SourceBuffer 있음 → 중복 생성 방지");
//       return;
//     }

//     const sourceBuffer = mediaSource.addSourceBuffer(mime);
//     onSourceBufferReady({ current: sourceBuffer }, mediaSource);
//   });
// }

export function setupMediaSource(audioRef, onSourceBufferReady) {
  // 브라우저를 체크하여 적절한 MIME 타입을 선택
  const mime = (function () {
    if (
      navigator.userAgent.indexOf('Chrome') !== -1 ||
      navigator.userAgent.indexOf('Firefox') !== -1
    ) {
      // Chrome, Firefox는 WebM + Opus 지원
      return 'audio/webm; codecs="opus"';
    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
      // Safari는 MP4(AAC) 사용
      return 'audio/mp4; codecs="mp4a.40.2"';
    } else {
      console.error('지원되지 않는 브라우저입니다.');
      return null; // 지원되지 않는 브라우저일 경우 MIME 타입을 설정하지 않음
    }
  })();

  // 지원되는 MIME 타입이 아닌 경우, 오류 메시지 출력
  if (!mime) {
    console.error('이 브라우저는 해당 포맷을 지원하지 않습니다.');
    return;
  }

  if (!MediaSource.isTypeSupported(mime)) {
    console.error(`${mime} 포맷을 지원하지 않습니다.`);
  } else {
    console.log(`${mime} 포맷을 지원합니다.`);
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
