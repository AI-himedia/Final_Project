// src/App.js
import './App.css';

// api
import axiosInstance from './shared/api/AxiosInstance';

// components
import Header from './shared/components/Header';
import LoginPage from './shared/pages/login/LoginPage';

// test page
import ConnectionTestPage from './web/test/ConnectionTestPage';
import RealTimeAudioStream from './web/test/RealTimeAudioStream';

// pages
import MainPage from './shared/pages/MainPage';
import SideMenu from './shared/components/SideMenu';
import UpButton from './shared/components/UpButton';
import KakaoRedirectPage from './shared/pages/login/KakaoRedirectPage';
import SignUpPage from './shared/pages/login/SignUpPage';

// hooks
import { useAuthCheck } from './shared/hooks/useAuthCheck';

// context
import { LoadingProvider, useLoading } from './shared/context/LoadingContext';

// 라이브러리
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { useState } from 'react';

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  return (
    isLoading && (
      <div className="Spinner_Overlay">
        <ScaleLoader />
      </div>
    )
  );
};

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
      setIsLogin(false); // 상태 즉시 업데이트
      Navigate('/');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  const hiddenLayoutRoutes = ['/login', '/test'];
  const isHiddenLayout = hiddenLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <LoadingProvider>
      <div className="App">
        {!isHiddenLayout && (
          <>
            <Header
              isMainPage={location.pathname === '/'}
              isLogin={isLogin}
              onLogout={handleLogout}
            />
            <SideMenu />
            <UpButton />
          </>
        )}
        <LoadingOverlay />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/member/kakao" element={<KakaoRedirectPage />} />

          <Route path="/test" element={<ConnectionTestPage />} />
          <Route path="/wstest" element={<RealTimeAudioStream />} />
        </Routes>
      </div>
    </LoadingProvider>
  );
}
