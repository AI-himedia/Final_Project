import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAccessToken, clearAuth } from '../redux/Slice/authSlice';
import { axiosInstance } from '../api/axios/AxiosInstance';

export const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    axiosInstance
      .post('/member/token/refresh')
      .then((res) => {
        dispatch(setAccessToken(res.data.accessToken));
      })
      .catch(() => {
        dispatch(clearAuth());
        window.location.href = '/login';
      });
  }, []);
};
