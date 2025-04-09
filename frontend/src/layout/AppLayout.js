// src/layout/AppLayout.js

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SideBar from '../components/SideBar/SideBar';
import UpButton from '../components/UpButton/UpButton';
import { useAuthCheck } from '../hooks/useAuthCheck';
import { useState } from 'react';
import { axiosInstance } from '../services/axios/AxiosInstance';
import { useLocation, Navigate } from 'react-router-dom';

export default function AppLayout({ children, meta }) {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false);

  useAuthCheck((loginStatus) => setIsLogin(loginStatus));

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/member/logout');
      setIsLogin(false);
      Navigate('/');
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
