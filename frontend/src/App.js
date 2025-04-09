// 공통 스타일
import './App.css';

// API 요청 인스턴스
import axiosInstance from './services/api/AxiosInstance';

// 전역 UI 컴포넌트
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SideBar from './components/SideBar/SideBar';
import UpButton from './components/UpButton/UpButton';

// 경로별 UI 표시 조건 (Header, Footer 등)
import { routeMeta } from './routes/RouteMeta.js';

// 로그인 상태 체크 훅
import { useAuthCheck } from './hooks/useAuthCheck';

// 라우팅 관련 라이브러리
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';

// 주요 페이지 컴포넌트
import MainPage from './pages/shared/main/MainPage';
import LoginPage from './pages/shared/auth/LoginPage';
import SignUpPage from './pages/shared/auth/SignUpPage/SignUpPage';
import KakaoRedirectPage from './pages/shared/auth/KakaoRedirectPage/KakaoRedirectPage';

import ApplyPage from './pages/app/service/ApplyPage/ApplyPage';
import CallPage from './pages/app/service/CallPage/CallPage';
import SmsPage from './pages/app/service/SmsPage/SmsPage';
import TermsOfServicePage from './pages/app/service/TermsOfServicePage/TermsOfServicePage';
import ProductPage from './pages/app/service/ProductPage/ProductPage';

// 테스트 페이지
import ConnectionTestPage from './test/ConnectionTestPage';
import RealTimeAudioStream from './test/RealTimeAudioStream';
import TTSAudioPlayer from './test/TTSAudioPlayer.js';
import CallService from './test/CallService.js';

export default function App() {
  const location = useLocation();
  // 로그인 상태 저장 (header변경)
  const [isLogin, setIsLogin] = useState(false);

  // 현재 경로 기준으로 UI 요소 노출 여부 가져옴
  const meta = routeMeta[location.pathname] || {
    showHeader: true,
    showFooter: true,
    showSidebar: true,
    showUpButton: true,
  };

  // 로그인 상태 확인 (처음 마운트될 때 실행)
  useAuthCheck((loginStatus) => {
    setIsLogin(loginStatus);
  });

  // 로그아웃 요청 및 처리
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/member/logout');
      setIsLogin(false);
      Navigate('/'); // 로그아웃 후 메인 이동
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <div className={`App ${meta.showFooter ? 'hasFooter' : ''}`}>
      {/* 경로별 Header 노출 조건 */}
      {meta.showHeader && (
        <Header
          isMainPage={location.pathname === '/'}
          isLogin={isLogin}
          onLogout={handleLogout}
        />
      )}

      {/* 사이드바, 위로 버튼 조건부 렌더링 */}
      {meta.showSidebar && <SideBar />}
      {meta.showUpButton && <UpButton />}

      {/* 라우트 정의 */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/member/kakao" element={<KakaoRedirectPage />} />

        <Route path="/service" element={<ApplyPage />} />
        <Route path="/service/terms" element={<TermsOfServicePage />} />
        <Route path="/service/sms" element={<SmsPage />} />
        <Route path="/service/call" element={<CallPage />} />
        <Route path="/service/product" element={<ProductPage />} />

        <Route path="/payment/fail" element={<div>결제 실패</div>} />
        <Route path="/payment/complete" element={<div>결제 완료</div>} />

        <Route path="/test" element={<ConnectionTestPage />} />
        <Route path="/wstest" element={<RealTimeAudioStream />} />
        <Route path="/ttstest" element={<TTSAudioPlayer />} />
        <Route path="/call" element={<CallService />} />
      </Routes>

      {/* Footer 노출 조건 */}
      {meta.showFooter && <Footer />}
    </div>
  );
}
