// src/App.js
import './App.css';

// api
import axiosInstance from './api/AxiosInstance';

// components
import Header from './components/Header';
import NoticeCreate from './pages/notice/NoticeCreate';
import NoticeDetail from './pages/notice/NoticeDetail';
import NoticeList from './pages/notice/NoticeList';
import LoginPage from './pages/login/LoginPage';

// test page
import ConnectionTestPage from './test/ConnectionTestPage';
import RealTimeAudioStream from './test/RealTimeAudioStream';

// pages
import MainPage from './pages/MainPage';
import SideMenu from './components/SideMenu';
import UpButton from './components/UpButton';
import KakaoRedirectPage from './pages/login/KakaoRedirectPage';
import SignUpPage from './pages/login/SignUpPage';

// context
import { LoadingProvider, useLoading } from './context/LoadingContext';

// 라이브러리
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { useState } from 'react';
import { useAuthCheck } from './hooks/useAuthCheck';

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
        <Header
          isMainPage={location.pathname === '/'}
          isLogin={isLogin}
          onLogout={handleLogout}
        />
        <SideMenu />
        <UpButton />
        <LoadingOverlay />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/member/kakao" element={<KakaoRedirectPage />} />
          <Route path="/notice" element={<NoticeList />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/notice/create" element={<NoticeCreate />} />
          <Route path="/test" element={<ConnectionTestPage />} />
          <Route path="/wstest" element={<RealTimeAudioStream />} />
        </Routes>
      </div>
    </LoadingProvider>
  );
}
