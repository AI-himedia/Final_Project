// src/routes/PrivateRoute.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: '로그인이 필요한 페이지입니다',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      navigate(-1, { state: { from: location }, replace: true });
    }
  }, [isLoggedIn, navigate, location]);

  if (!isLoggedIn) return null;

  return children;
}
