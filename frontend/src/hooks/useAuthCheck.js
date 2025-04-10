import { useState, useEffect } from 'react';
import { axiosInstance } from '../services/axios/AxiosInstance';

export const useAuthCheck = (onDone) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get('/member/me');
        setIsLoggedIn(true);
        if (onDone) onDone(true);
      } catch (err) {
        // 로그인되지 않았을 때는 오류를 무시하고, 상태만 업데이트
        if (err.response?.status !== 401) {
          console.error('인증 오류:', err);
        }
        setIsLoggedIn(false);
        if (onDone) onDone(false);
      }
    };
    checkAuth();
  }, [onDone]);

  return { isLoggedIn };
};
