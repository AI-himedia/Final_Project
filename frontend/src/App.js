// 공통 스타일
import './App.css';

// API 인스턴스
import axiosInstance from './services/api/AxiosInstance';

// 컴포넌트
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import SideBar from './components/SideBar/SideBar.js';
import UpButton from './components/UpButton/UpButton.js';

// 테스트용 페이지
import ConnectionTestPage from './test/ConnectionTestPage.js';
import RealTimeAudioStream from './test/RealTimeAudioStream.js';
import TTSAudioPlayer from './test/TTSAudioPlayer.js';

// 페이지
import MainPage from './pages/shared/main/MainPage.js';
import LoginPage from './pages/shared/auth/LoginPage.js';
import SignUpPage from './pages/shared/auth/SignUpPage/SignUpPage.js';
import KakaoRedirectPage from './pages/shared/auth/KakaoRedirectPage/KakaoRedirectPage.js';
import ApplyPage from './pages/app/service/ApplyPage/ApplyPage.js';
import CallPage from './pages/app/service/CallPage/CallPage.js';
import SmsPage from './pages/app/service/SmsPage/SmsPage.js';
import TermsOfServicePage from './pages/app/service/TermsOfServicePage/TermsOfServicePage.js';
import PaymentNoticePage from './pages/app/service/PaymentNoticePage/PaymentNoticePage.js';

// hooks
import { useAuthCheck } from './hooks/useAuthCheck';

// 라이브러리
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';
import CallService from './test/CallService.js';

export default function App() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false);

  // 로그인 상태 확인 (최초 렌더 시)
  useAuthCheck((loginStatus) => {
    setIsLogin(loginStatus);
  });

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/member/logout');
      setIsLogin(false);
      Navigate('/');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  // Footer가 필요한 페이지
  const isFooterPage = ['/'].includes(location.pathname);

  // Header 숨겨야 하는 라우트
  const noHeaderRoutes = [
    '/service',
    '/service/call',
    '/service/sms',
    '/test',
    '/wstest',
  ];
  const isHeaderHidden = noHeaderRoutes.includes(location.pathname);

  // SideBar, UpButton 숨김 처리 라우트
  const noSidebarRoutes = [...noHeaderRoutes];
  const noUpButtonRoutes = [...noHeaderRoutes];

  return (
    <div className={`App ${isFooterPage ? 'hasFooter' : ''}`}>
      {!isHeaderHidden && (
        <Header
          isMainPage={location.pathname === '/'}
          isLogin={isLogin}
          onLogout={handleLogout}
        />
      )}

      {!noSidebarRoutes.includes(location.pathname) && <SideBar />}
      {!noUpButtonRoutes.includes(location.pathname) && <UpButton />}

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/member/kakao" element={<KakaoRedirectPage />} />

        <Route path="/service" element={<ApplyPage />} />
        <Route path="/service/terms" element={<TermsOfServicePage />} />
        <Route path="/service/sms" element={<SmsPage />} />
        <Route path="/service/call" element={<CallPage />} />
        <Route path="/service/payment-notice" element={<PaymentNoticePage />} />

        <Route path="/test" element={<ConnectionTestPage />} />
        <Route path="/wstest" element={<RealTimeAudioStream />} />
        <Route path='/ttstest' element={<TTSAudioPlayer/>}/>
        <Route path="/call" element={<CallService />} />
      </Routes>

      <Footer />
    </div>
  );
}
