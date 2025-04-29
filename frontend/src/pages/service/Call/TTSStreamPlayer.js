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
  // 지원하려는 MIME 타입 목록 (선호도 순)
  const potentialMimes = [
    'audio/webm; codecs="opus"', // WebM + Opus (Chrome, Firefox 등)
    'audio/mp4; codecs="mp4a.40.2"', // MP4 + AAC (Safari, Edge 등)
    // 필요한 경우 다른 포맷 추가
  ];

  let supportedMime = null;
  for (const mime of potentialMimes) {
    if (MediaSource.isTypeSupported(mime)) {
      supportedMime = mime;
      console.log(`지원되는 MIME 타입 발견: ${supportedMime}`);
      break; // 첫 번째로 지원되는 타입을 사용
    } else {
      console.log(`${mime} 타입은 지원되지 않음.`);
    }
  }

  // 지원되는 MIME 타입이 없는 경우
  if (!supportedMime) {
    console.error('이 브라우저에서 지원하는 오디오 포맷을 찾을 수 없습니다.');
    // 사용자에게 알림 표시 등의 추가 처리 가능
    return;
  }

  // MediaSource 설정 (기존 코드와 유사)
  try {
    const mediaSource = new MediaSource();
    const url = URL.createObjectURL(mediaSource);
    audioRef.current.src = url;
    // audioRef.current.load(); // sourceopen 핸들러가 설정된 후 로드하는 것이 더 안전할 수 있음

    mediaSource.addEventListener('sourceopen', () => {
      console.log('[setupMediaSource] sourceopen 이벤트 발생');

      // sourceopen 이벤트 핸들러 내에서 기존 SourceBuffer 확인 및 제거 (선택적)
      // while (mediaSource.sourceBuffers.length > 0) {
      //   console.warn("기존 SourceBuffer 제거");
      //   mediaSource.removeSourceBuffer(mediaSource.sourceBuffers[0]);
      // }

      // readyState 확인 (디버깅용)
      console.log(`MediaSource readyState: ${mediaSource.readyState}`); // 'open' 상태여야 함

      if (mediaSource.readyState === 'open') {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer(supportedMime);
          console.log('SourceBuffer 성공적으로 추가됨');
          onSourceBufferReady({ current: sourceBuffer }, mediaSource); // 콜백 호출

          // SourceBuffer 관련 이벤트 리스너 추가 (디버깅 및 오류 처리)
          sourceBuffer.addEventListener('error', (e) =>
            console.error('SourceBuffer 오류:', e)
          );
          sourceBuffer.addEventListener('updateend', () =>
            console.log('SourceBuffer 업데이트 완료')
          ); // 데이터 추가 후 발생
        } catch (e) {
          console.error('SourceBuffer 추가 중 오류 발생:', e);
          console.error(`사용한 MIME 타입: ${supportedMime}`);
          // MediaSource 종료 또는 오류 처리
          if (mediaSource.readyState === 'open') {
            // mediaSource.endOfStream('network'); // 또는 'decode'
          }
        }
      } else {
        console.warn(
          `sourceopen 이벤트 발생 시 readyState가 'open'이 아님: ${mediaSource.readyState}`
        );
      }
    });

    // sourceopen 핸들러가 등록된 후 로드 시작
    audioRef.current.load();

    // MediaSource 오류 처리
    mediaSource.addEventListener('sourceended', () =>
      console.log('MediaSource 상태: ended')
    );
    mediaSource.addEventListener('sourceclose', () =>
      console.log('MediaSource 상태: closed')
    );
    mediaSource.addEventListener('error', (e) =>
      console.error('MediaSource 오류:', e)
    ); // 거의 발생하지 않음

    // 오디오 요소 자체의 오류 처리
    audioRef.current.onerror = (e) => {
      console.error('오디오 요소 오류:', e);
      // audioRef.current.error 객체에 상세 정보 포함
      if (audioRef.current.error) {
        console.error('오디오 오류 코드:', audioRef.current.error.code);
        console.error('오디오 오류 메시지:', audioRef.current.error.message);
      }
    };
  } catch (e) {
    console.error('MediaSource 생성 또는 URL 생성 중 오류:', e);
  }
}
