// src/App.js

import './App.css';

// components
import Header from './components/Header';
import NoticeCreate from './pages/notice/NoticeCreate';
import NoticeDetail from './pages/notice/NoticeDetail';
import NoticeList from './pages/notice/NoticeList';

// test page
import ConnectionTestPage from './test/ConnectionTestPage';
import RealTimeAudioStream from './test/RealTimeAudioStream';

// pages
import LoginPage from './pages/login/LoginPage';
import MainPage from './pages/MainPage';
import SideMenu from './components/SideMenu';
import UpButton from './components/UpButton';
import KakaoRedirectPage from './pages/login/KakaoRedirectPage';
import SignUpPage from './pages/login/SignUpPage';

// context
import { LoadingProvider, useLoading } from './context/LoadingContext';

// hooks
import { useAuthCheck } from './hooks/useAuthCheck';

// 라이브러리
import { Route, Routes, useLocation } from 'react-router-dom';
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
  const [isReady, setIsReady] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const location = useLocation();

  useAuthCheck((loginStatus) => {
    setIsLogin(loginStatus); // true 또는 false
    setIsReady(true);
  });

  const hiddenLayoutRoutes = ['/login', '/test'];
  const isHiddenLayout = hiddenLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  if (!isReady) return null;

  return (
    <LoadingProvider>
      <div className="App">
        <Header isMainPage={location.pathname === '/'} isLogin={isLogin} />
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
