// src/utils/jwtUtils.js
export const scheduleTokenRefresh = (accessToken, refreshJWT) => {
  if (!accessToken) return;

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = payload.exp * 1000; // 초 → 밀리초
    const now = Date.now();
    const delay = exp - now - 3000; // 🔄 3초 전 미리

    if (delay > 0) {
      console.log(`[토큰 스케줄링] ${delay}ms 후 refresh 예정`);
      setTimeout(() => {
        console.log('[토큰 스케줄링] 자동 refresh 실행');
        refreshJWT();
      }, delay);
    } else {
      console.warn('[토큰 스케줄링] 이미 만료 또는 너무 짧음, 예약 생략');
    }
  } catch (e) {
    console.error('[토큰 디코딩 실패]', e);
  }
};
