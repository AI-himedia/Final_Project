// hooks/useAuth.js

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/Slice/userSlice';
import { axiosInstance } from '../api/AxiosInstance';

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AUTH] useEffect start', Date.now());
    setIsLoading(true); // 로딩 시작 시점 명확화
    axiosInstance
      .get('/member/me', { withCredentials: true })
      .then((res) => {
        console.log('[AUTH] API success', Date.now());
        dispatch(setUser(res.data));
      })
      .catch(() => {
        console.log('[AUTH] API error', Date.now());
        dispatch(clearUser());
      })
      .finally(() => {
        console.log('[AUTH] API finally, setting isLoading false', Date.now());
        setIsLoading(false);
      });
  }, [dispatch]);

  return { isLoading };
};
