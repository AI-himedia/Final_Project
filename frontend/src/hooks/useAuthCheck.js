// src/hooks/useAuthCheck.js

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLogin, setLogout } from '../redux/LoginSlice';
import axiosInstance from '../api/AxiosInstance';

export const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get('/member/me');
        const email = res.data.email;
        dispatch(setLogin(email));
      } catch (err) {
        dispatch(setLogout());
      }
    };

    checkAuth();
  }, [dispatch]);
};
