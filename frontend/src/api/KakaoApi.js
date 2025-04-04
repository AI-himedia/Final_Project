// src/api/KakaoApi.js

import axios from 'axios';
import { API_SERVER_HOST, FRONT_HOST } from '../config/ApiConfig';
import { setLogin } from '../redux/LoginSlice';

const rest_api_key = process.env.REACT_APP_KAKAO_REST_API_KEY;
const redirect_uri = `${FRONT_HOST}/member/kakao`;
const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

export const getKakaoLoginLink = () => {
  const kakaoURL = new URL(auth_code_path);
  kakaoURL.searchParams.append('client_id', rest_api_key);
  kakaoURL.searchParams.append('redirect_uri', redirect_uri);
  kakaoURL.searchParams.append('response_type', 'code');
  return kakaoURL.toString();
};

// 로그인 리디렉트 처리용 함수
export const handleKakaoLoginRedirect = async (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) throw new Error('카카오 인증 코드 없음');

  try {
    const res = await axios.get(
      `${API_SERVER_HOST}/api/member/kakao/token?code=${code}`,
      { withCredentials: true }
    );
    console.log('카카오 로그인 완료:', res.data);

    // Redux 상태 갱신
    const email = res.data?.email;
    if (email) {
      dispatch(setLogin(email));
    }

    return res.data;
  } catch (err) {
    console.error('카카오 로그인 실패:', err);
    throw err;
  }
};
