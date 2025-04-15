// App.js 수정
import { useEffect, useMemo } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';
import { routeMeta } from './routes/RouteMeta';
import { AppRoutes } from './routes/AppRoutes';
import AppLayout from './components/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './hooks/useAuth';
import { setUser } from './redux/Slice/userSlice';

function App() {
  // useAuth 훅을 App 컴포넌트 레벨에서 호출
  const { isLoading } = useAuth();

  // 인증 상태 확인 중이면 로딩 화면 표시
  if (isLoading) {
    // 앱 전체 로딩 또는 최소한의 레이아웃과 스피너 표시 가능
  }

  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const isLoginSuccess = query.get('login') === 'success';

    if (isLoginSuccess) {
      // 백엔드에서 유저 정보도 같이 넘겨줬다면 여기서 처리
      // 예시: window.localStorage.setItem('user', JSON.stringify({...}))
      const savedUser = JSON.parse(localStorage.getItem('user'));

      if (savedUser) {
        dispatch(setUser(savedUser));
      }

      // URL 정리 (파라미터 제거)
      window.history.replaceState({}, '', '/');
    }
  }, [location.search, dispatch]);
  // 메타 정보 설정
  const meta = useMemo(() => {
    return (
      routeMeta[location.pathname] || {
        showHeader: true,
        showFooter: true,
        showSidebar: true,
        showUpButton: true,
      }
    );
  }, [location.pathname]);

  // 사용자 정보 로딩이 완료된 후 앱 렌더링
  return (
    <div className={`App ${meta.showFooter ? 'hasFooter' : ''}`}>
      <AppLayout meta={meta}>
        <AppRoutes />
        {/* <EnvLogger /> */}
      </AppLayout>
    </div>
  );
}

export default App;
