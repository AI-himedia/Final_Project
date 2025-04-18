import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useEffect, useRef } from 'react';

export default function PrivateRoute() {
  const user = useSelector((state) => state.user.user);
  const isLoading = useSelector((state) => state.user.isLoading);
  const location = useLocation();
  const hasShownAlert = useRef(false);

  const isAuthenticated = !!user?.userCode;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownAlert.current) {
      hasShownAlert.current = true;
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: '로그인이 필요한 페이지입니다',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
