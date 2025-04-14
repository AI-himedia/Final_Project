// src/components/Header/Header.js

import HeaderMain from '../../layout/Header/HeaderMain';
import HeaderTerms from '../../layout/Header/HeaderTerms';
import HeaderProduct from '../../layout/Header/HeaderProduct';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderApply from '../../layout/Header/HeaderApply';
import { axiosInstance } from '../../api/axios/AxiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../redux/Slice/UserSlice';

export default function Header(props) {
  const { pathname } = useLocation();
  const isLogin = useSelector((state) => state.user.status);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    axiosInstance
      .post('/be/member/logout', {}, { withCredentials: true })
      .finally(() => {
        dispatch(clearUser());
        navigate('/');
      });
  };

  const headerProps = {
    ...props,
    isLogin,
    onLogout: handleLogout,
  };

  if (pathname === '/service/terms/product')
    return <HeaderProduct {...headerProps} />;
  if (pathname === '/service/check') return <HeaderApply {...headerProps} />;
  if (pathname === '/service/terms') return <HeaderTerms {...headerProps} />;
  if (pathname === '/service') return <HeaderApply {...headerProps} />;
  return <HeaderMain {...headerProps} />;
}
