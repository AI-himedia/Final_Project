// components/Header/Header.js

import * as HeaderVariants from './variants';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../redux/Slice/userSlice';
import { axiosInstance } from '../../api/AxiosInstance';

// 헤더 매핑 정의
const headerMap = [
  { path: '/service/terms/product', component: HeaderVariants.HeaderProduct },
  { path: '/service/check', component: HeaderVariants.HeaderApply },
  { path: '/service/terms', component: HeaderVariants.HeaderTerms },
  { path: '/service', component: HeaderVariants.HeaderApply },
];

export default function Header(props) {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.user.status);

  const handleLogout = () => {
    axiosInstance
      .post('/member/logout', {}, { withCredentials: true })
      .finally(() => {
        dispatch(clearUser());
        navigate('/');
      });
  };

  const commonProps = {
    ...props,
    isLogin,
    onLogout: handleLogout,
  };

  const MatchedHeader = headerMap.find(
    (entry) => pathname === entry.path
  )?.component;

  return MatchedHeader ? (
    <MatchedHeader {...commonProps} />
  ) : (
    <HeaderVariants.HeaderMain {...commonProps} />
  );
}
