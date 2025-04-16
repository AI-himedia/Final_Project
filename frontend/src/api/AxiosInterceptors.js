// src/api/axios/AxoisInterceptors

/*
hooks/useAuth.js는 메인화면 App에서 거의 매일 요청을 보내며 로그인 여부를 확인하며,
accessToken이 만료되면 백엔드가 401에러를 보내며, FE가 401감지 후 POST /token/refresh 호출
새 accessToken을 받아 재요청을 보내는 구조입니다.

그래서 /me 요청이 안되면 /me, /refresh 요청 오류가 2개 나는 것입니다.
*/

import { refreshJWT } from '../api/JwtApi';

export const applyInterceptors = (axiosInstance) => {
  // 요청 인터셉터
  axiosInstance.interceptors.request.use(
    (config) => {
      if (config.data instanceof URLSearchParams) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isTokenError =
        error.response?.data?.error === 'ERROR_ACCESS_TOKEN' ||
        error.response?.status === 401;

      if (isTokenError && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await refreshJWT();
          // return axiosInstance(originalRequest); // 재요청
        } catch (refreshErr) {
          // console.error('[DEBUG] 토큰 갱신 실패:', refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
};
