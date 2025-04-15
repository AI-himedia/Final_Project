// hooks/useAuth.js

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/Slice/userSlice';
import { axiosInstance } from '../api/AxiosInstance';

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get('/member/me', { withCredentials: true })
      .then((res) => {
        dispatch(setUser(res.data));
      })
      .catch(() => {
        dispatch(clearUser());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  return { isLoading };
};
