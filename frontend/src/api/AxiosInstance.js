// src/api/AxiosInstance.js

import axios from "axios";
import store from "../redux/Store";

import { API_SERVER_HOST } from "../config/ApiConfig";
import { setAccessToken } from "../redux/LoginSlice";

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `${API_SERVER_HOST}/api`,
  // 쿠키 허용
  withCredentials: true,
});

// JWT 토큰 갱신 함수
const refreshJWT = async () => {
  const res = await axiosInstance.get(`/member/refresh`);
  return res.data;
};

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().loginSlice.accessToken;
    console.log("axiosInstance.interceptors.request.use. token", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof URLSearchParams) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // const navigate = useNavigate();
    console.log("interceptor error: ", error);
    if (
      error.response.data &&
      error.response.data.error === "ERROR_ACCESS_TOKEN"
    ) {
      const result = await refreshJWT();
      console.log("refreshJWT RESULT", result);

      const accessToken = result.newAccessToken;

      store.dispatch(setAccessToken(accessToken));

      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
