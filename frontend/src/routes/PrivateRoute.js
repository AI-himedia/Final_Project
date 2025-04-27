import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { Toast } from '../utils/Swal';

export default function PrivateRoute() {
  const user = useSelector((state) => state.user.user);
  const isLoading = useSelector((state) => state.user.isLoading);
  const location = useLocation();
  const hasShownAlert = useRef(false);

  const isAuthenticated = !!user?.userCode;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownAlert.current) {
      hasShownAlert.current = true;
      Toast.fire({
        icon: 'warning',
        title: '로그인이 필요한 페이지입니다',
      });
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
