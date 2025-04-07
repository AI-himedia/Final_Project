// src/api/KakaoApi.js

import axios from 'axios';
import { API_SERVER_HOST, FRONT_HOST } from '../config/ApiConfig';

const rest_api_key = process.env.REACT_APP_KAKAO_REST_API_KEY;
const redirect_uri = `${FRONT_HOST}/member/kakao`;
const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

// 카카오 로그인 링크 생성
export const getKakaoLoginLink = () => {
  const kakaoURL = new URL(auth_code_path);
  kakaoURL.searchParams.append('client_id', rest_api_key);
  kakaoURL.searchParams.append('redirect_uri', redirect_uri);
  kakaoURL.searchParams.append('response_type', 'code');
  return kakaoURL.toString();
};

// 카카오 로그인 리디렉트 처리 (기존/신규 분기)
export const handleKakaoLoginRedirect = async (dispatch, navigate) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) throw new Error('카카오 인증 코드 없음');

  try {
    const res = await axios.get(
      `${API_SERVER_HOST}/api/member/kakao/token?code=${code}`,
      { withCredentials: true }
    );

    const email = res.data?.email;
    // if (email) dispatch(setLogin(email));

    if (res.status === 200) {
      // 기존 회원: 홈으로 이동하고 새로고침
      navigate('/');
      setTimeout(() => window.location.reload(), 100); // 약간의 delay 후 새로고침
    } else if (res.status === 202) {
      // 신규 회원: 추가정보 입력 페이지로 이동
      navigate('/signup', {
        state: {
          email: email,
          oauth: 'KAKAO',
        },
      });
    }

    return res.data;
  } catch (err) {
    console.error('카카오 로그인 실패:', err);
    navigate('/login');
    throw err;
  }
};
