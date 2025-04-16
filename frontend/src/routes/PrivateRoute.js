// src/routes/PrivateRoute.js
import { Outlet } from 'react-router-dom';
import { useAuthenticate } from '../hooks/useAuthenticate';
import Swal from 'sweetalert2';
import { useEffect, useRef } from 'react';

export default function PrivateRoute() {
  const isAuthenticated = useAuthenticate();
  const hasShownAlert = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !hasShownAlert.current) {
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
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
}
