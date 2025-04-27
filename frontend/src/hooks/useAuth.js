import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '../redux/Slice/userSlice';
import { axiosInstance } from '../api/AxiosInstance';
import { Toast } from '../utils/Swal';

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const loginAttempted = useRef(false);

  useEffect(() => {
    setIsLoading(true);

    const checkAuthStatus = () => {
      axiosInstance
        .get('/member/me', { withCredentials: true })
        .then((res) => {
          dispatch(setUser(res.data));
          setIsLoggedIn(true);

          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('login') === 'success') {
            Toast.fire({
              icon: 'success',
              title: '로그인 성공!',
            });

            const nextURL = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, nextURL);
          }
        })
        .catch((error) => {
          dispatch(clearUser());
          setIsLoggedIn(false);

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
  }, [dispatch]);

  return { isLoading, isLoggedIn };
};
