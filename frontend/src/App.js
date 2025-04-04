// src/App.js

// Styles
import './App.css';

// components
import Header from './components/Header';
import NoticeCreate from './pages/notice/NoticeCreate';
import NoticeDetail from './pages/notice/NoticeDetail';
import NoticeList from './pages/notice/NoticeList';

// pages
import LoginPage from './pages/login/LoginPage';
import ConnectionTestPage from './pages/ConnectionTestPage';
import MainPage from './pages/MainPage';
import SideMenu from './components/SideMenu';
import UpButton from './components/UpButton';
import KakaoRedirectPage from './pages/login/KakaoRedirectPage';

// context
import { LoadingProvider, useLoading } from './context/LoadingContext';

// hooks
import { useAuthCheck } from './hooks/useAuthCheck';

// 라이브러리
import { Route, Routes, useLocation } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';

/**
 * LoadingOverlay 컴포넌트
 * 로딩 중일 때 스피너를 화면에 표시합니다.
 */
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
  useAuthCheck();

  const location = useLocation();

  // Header와 Footer를 숨길 경로 목록
  const hiddenLayoutRoutes = ['/login', '/test'];

  const isHiddenLayout = hiddenLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <LoadingProvider>
      <div className="App">
        {!isHiddenLayout ? (
          <Header isMainPage={location.pathname === '/'} />
        ) : null}
        <SideMenu />
        <UpButton />
        <LoadingOverlay />
        <Routes>
          <Route path="/" element={<MainPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/member/kakao" element={<KakaoRedirectPage />} />

          <Route path="/notice" element={<NoticeList />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/notice/create" element={<NoticeCreate />} />

          <Route path="/test" element={<ConnectionTestPage />} />
        </Routes>
      </div>
    </LoadingProvider>
  );
}
