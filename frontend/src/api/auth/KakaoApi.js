// src/api/auth/KakaoApi.js
import axios from 'axios';
import { API_SERVER_HOST } from '../../config/ApiConfig.js';

export const kakaoLoginRedirect = async (code) => {
  if (!code) {
    throw new Error('카카오 인증 코드가 없습니다.');
  }

  const response = await axios.get(
    `${API_SERVER_HOST}/be/member/kakao/token?code=${code}`,
    {
      withCredentials: true,
      validateStatus: (status) => status === 200 || status === 202,
    }
  );

  const { status, data } = response;
  const email = data?.email;

  return { status, email, data };
};
