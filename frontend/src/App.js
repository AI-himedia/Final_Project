// App.js 수정
import { useEffect, useMemo } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';
import { routeMeta } from './routes/RouteMeta';
import { AppRoutes } from './routes/AppRoutes';
import AppLayout from './components/MainLayout';
import { useSelector } from 'react-redux';

function App() {
  const location = useLocation();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    console.log('[DEBUG] 현재 리덕스 user 상태:', user);
  }, [user]);

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
