import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/Slice/UserSlice';
import { axiosInstance } from '../api/axios/AxiosInstance';

export default function useAuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    axiosInstance
      .get('/member/me', { withCredentials: true })
      .then((res) => {
        dispatch(
          setUser({
            ...res.data,
            status: true,
          })
        );
      })
      .catch((err) => {
        dispatch(clearUser());
      });
  }, [dispatch]);
}
