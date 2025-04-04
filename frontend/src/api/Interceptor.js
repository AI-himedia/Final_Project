// src/api/Interceptor.js

import { refreshJWT } from './JwtApi';

export const applyInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      if (config.data instanceof URLSearchParams) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log('🧨 인터셉터 발동');
      console.log('📛 error status:', error.response?.status);
      console.log('📛 error data:', error.response?.data);

      const isTokenError = error.response?.data?.error === 'ERROR_ACCESS_TOKEN';

      if (isTokenError) {
        try {
          console.log('🔁 리프레시 토큰 요청 시도');
          await refreshJWT();
          return axiosInstance(error.config);
        } catch (refreshErr) {
          console.log('❌ 리프레시 실패', refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
};
