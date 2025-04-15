// src/api/axios/AxoisInterceptors

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
          console.error('[DEBUG] 토큰 갱신 실패:', refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
};
