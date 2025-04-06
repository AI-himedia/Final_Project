// src/hooks/useAuthCheck.js
import { useState, useEffect } from 'react';
import axiosInstance from '../api/AxiosInstance';

export const useAuthCheck = (onDone) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get('/member/me');
        setIsLoggedIn(true);
        if (onDone) onDone(true); // 로그인 성공
      } catch (err) {
        setIsLoggedIn(false);
        if (onDone) onDone(false); // 로그인 실패
      }
    };
    checkAuth();
  }, [onDone]);

  return { isLoggedIn };
};
