// src/pages/login/KakaoRedirectPage.js

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/AxiosInstance';

export default function KakaoRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        // 카카오 로그인 처리 (access/refresh 쿠키 저장)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (!code) throw new Error('카카오 인증 코드 없음');

        const res = await axiosInstance.get(`/member/kakao/token?code=${code}`);
        const email = res.data?.email;
        if (email) {
        }

        // 쿠키 저장 후 로그인 상태 검증 요청
        const verify = await axiosInstance.get('/member/me');
        if (verify.data.email) {
        }

        // 상태에 따라 분기
        if (res.status === 200) {
          navigate('/');
        } else if (res.status === 202) {
          navigate('/signup', {
            state: {
              email: res.data.email,
              oauth: 'KAKAO',
            },
          });
        }
      } catch (err) {
        navigate('/login');
      }
    };

    handleLogin();
  }, [navigate]);

  return;
}
