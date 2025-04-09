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
      const isTokenError =
        error.response?.data?.error === 'ERROR_ACCESS_TOKEN' ||
        error.response?.status === 401;

      if (isTokenError) {
        try {
          await refreshJWT();
          return axiosInstance(error.config);
        } catch (refreshErr) {
          console.log('RefreshError', refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
};
