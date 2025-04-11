import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/Slice/UserSlice';
import { axiosInstance } from '../api/axios/AxiosInstance';

export default function useFetchUser() {
  const dispatch = useDispatch();
  const isMounted = useRef(false);

  useEffect(() => {
    // 이미 마운트되었다면 중복 요청 방지
    if (isMounted.current) return;
    isMounted.current = true;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/member/me');
        dispatch(setUser({ ...res.data, status: true }));
      } catch (error) {
        console.log('사용자 정보 가져오기 실패:', error);
        dispatch(setUser({ status: false }));
      }
    };

    fetchUser();
  }, [dispatch]);
}
