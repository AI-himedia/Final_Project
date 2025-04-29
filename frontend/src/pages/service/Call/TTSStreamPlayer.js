const setupMediaSource = (audioRef, onTTSStart, onTTSEnd) => {
  const mediaSource = new MediaSource();
  const sourceBufferRef = { current: null };

  audioRef.current.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener('sourceopen', () => {
    try {
      // WebM + Opus 포맷용 SourceBuffer 생성
      sourceBufferRef.current = mediaSource.addSourceBuffer(
        'audio/webm; codecs=opus'
      );
      onTTSStart(sourceBufferRef);
    } catch (e) {
      console.error('SourceBuffer 생성 오류:', e);
    }
  });

  mediaSource.addEventListener('sourceended', () => {
    console.log('MediaSource 재생 종료됨');
    if (onTTSEnd) onTTSEnd();
  });

  return sourceBufferRef;
};

export { setupMediaSource };
