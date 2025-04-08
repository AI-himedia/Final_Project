// src/App.js
import './App.css';

// api
import axiosInstance from './services/api/AxiosInstance';

// components
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import SideBar from './components/SideBar/SideBar.js';
import UpButton from './components/UpButton/UpButton.js';

// test page
import ConnectionTestPage from './test/ConnectionTestPage.js';
import RealTimeAudioStream from './test/RealTimeAudioStream.js';

// pages
import MainPage from './pages/shared/main/MainPage.js';
import LoginPage from './pages/shared/auth/LoginPage.js';
import SignUpPage from './pages/shared/auth/SignUpPage/SignUpPage.js';
import KakaoRedirectPage from './pages/shared/auth/KakaoRedirectPage/KakaoRedirectPage.js';
import ApplyPage from './pages/app/service/ApplyPage/ApplyPage.js';

// hooks
import { useAuthCheck } from './hooks/useAuthCheck';

// 라이브러리
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function App() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false);

  // useAuthCheck 훅을 사용하여 로그인 상태 확인
  useAuthCheck((loginStatus) => {
    setIsLogin(loginStatus);
  });

  // 로그아웃 핸들러를 상위 컴포넌트로 이동
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/member/logout');
      setIsLogin(false);
      Navigate('/');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  // Footer 공백 지원 주소
  const isFooterPage = ['/'].includes(location.pathname);

  // Header 숨김 지원 주소
  const hiddenLayoutRoutes = ['/apply', '/test', '/wstest'];
  const isHiddenLayout = hiddenLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className={`App ${isFooterPage ? 'hasFooter' : ''}`}>
      {!isHiddenLayout && (
        <>
          <Header
            isMainPage={location.pathname === '/'}
            isLogin={isLogin}
            onLogout={handleLogout}
          />
          <SideBar />
          <UpButton />
        </>
      )}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/member/kakao" element={<KakaoRedirectPage />} />

        <Route path="/apply" element={<ApplyPage />} />

        <Route path="/test" element={<ConnectionTestPage />} />
        <Route path="/wstest" element={<RealTimeAudioStream />} />
      </Routes>
      <Footer />
    </div>
  );
}
