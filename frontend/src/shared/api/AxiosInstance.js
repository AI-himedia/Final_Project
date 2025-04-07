// src/api/AxiosInstance.js

import axios from 'axios';
import { API_SERVER_HOST } from '../config/ApiConfig';
import { applyInterceptors } from './Interceptor';

const axiosInstance = axios.create({
  baseURL: `${API_SERVER_HOST}/api`,
  withCredentials: true,
});

// 인터셉터 따로 분리 적용
applyInterceptors(axiosInstance);

export default axiosInstance;
