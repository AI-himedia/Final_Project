// hooks/useAuth.js
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/Slice/userSlice';
import { axiosInstance } from '../api/AxiosInstance';
import Swal from 'sweetalert2';

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const loginAttempted = useRef(false);

  useEffect(() => {
    setIsLoading(true);

    const checkAuthStatus = () => {
      axiosInstance
        .get('/member/me', { withCredentials: true })
        .then((res) => {
          dispatch(setUser(res.data));

          // /?login=success 로 접근한 경우에만 알림 표시
          if (
            !loginAttempted &&
            window.location.search.includes('login=success')
          ) {
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'success',
              title: '로그인 성공!',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            });
          }
        })
        .catch((error) => {
          dispatch(clearUser());

          if (
            error.response &&
            error.response.status === 401 &&
            !loginAttempted.current
          ) {
            loginAttempted.current = true;
            setTimeout(checkAuthStatus, 1);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    checkAuthStatus();
  }, [dispatch, loginAttempted]);

  return { isLoading };
};
