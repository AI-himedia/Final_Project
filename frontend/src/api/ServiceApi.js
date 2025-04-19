// import axios from "axios";
import { axiosInstance } from '../api/AxiosInstance';

// src/api/getServiceCheck.js

// service/terms
export const getServiceCheck = async (userCode) => {
  // console.log('[DEBUG] 요청 보냄 - userCode:', userCode);
  const response = await axiosInstance.get(
    `/subscription/me?userCode=${userCode}`
  );
  // console.log('[DEBUG] 응답 받음:', response.data);
  return response.data;
};

/*
Route: service/terms/check
userCode, servcieCode: 파라미터 확정
deceasedCode: null일 경우 파라미터 미포함
*/

export const getPostSubscribe = async ({
  userCode,
  serviceCode,
  deceasedCode,
}) => {
  const params = {
    userCode,
    serviceCode,
  };

  if (deceasedCode && deceasedCode !== 'null') {
    params.deceasedCode = deceasedCode;
  }

  const response = await axiosInstance.post('/subscription/subscribe', null, {
    params,
  });

  return response.data;
};

// getDeceasedProfile.js
export const getDeceasedProfile = async ({
  userCode,
  serviceCode,
  deceasedCode,
}) => {
  const params = {
    userCode,
    serviceCode,
  };

  if (deceasedCode && deceasedCode !== 'null') {
    params.deceasedCode = deceasedCode;
  }

  const response = await axiosInstance.get('/subscription/deceased', {
    params,
  });

  return response.data;
};