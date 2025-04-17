// import axios from "axios";
import { axiosInstance } from '../api/AxiosInstance';

// src/api/getServiceCheck.js

// service/terms
export const getServiceCheck = async (userCode) => {
  console.log('[DEBUG] 요청 보냄 - userCode:', userCode);
  const response = await axiosInstance.get(
    `/subscription/me?userCode=${userCode}`
  );
  console.log('[DEBUG] 응답 받음:', response.data);
  return response.data;
};
