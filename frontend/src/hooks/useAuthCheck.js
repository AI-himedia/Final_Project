import { useState, useEffect } from 'react';
import axiosInstance from '../services/api/AxiosInstance.js';

export const useAuthCheck = (onDone) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get('/member/me');
        setIsLoggedIn(true);
        if (onDone) onDone(true); // 로그인 성공
      } catch (err) {
        // 로그인되지 않았을 때는 오류를 무시하고, 상태만 업데이트
        if (err.response?.status !== 401) {
          console.error('인증 오류:', err);
        }
        setIsLoggedIn(false);
        if (onDone) onDone(false); // 로그인 실패
      }
    };
    checkAuth();
  }, [onDone]);

  return { isLoggedIn };
};
