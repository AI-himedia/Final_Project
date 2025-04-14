// src/layout/MainLayout.js

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SideBar from '../components/SideBar/SideBar';
import UpButton from '../components/UpButton/UpButton';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../redux/Slice/userSlice';
import { axiosInstance } from '.././api/AxiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MainLayout({ children, meta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.user.status);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/member/logout');
      dispatch(clearUser());
      navigate('/');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <>
      {meta.showHeader && (
        <Header
          isMainPage={location.pathname === '/'}
          isLogin={isLogin}
          onLogout={handleLogout}
        />
      )}
      {meta.showSidebar && <SideBar />}
      {meta.showUpButton && <UpButton />}
      {children}
      {meta.showFooter && <Footer />}
    </>
  );
}
