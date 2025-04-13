// App.js 수정
import { useMemo } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';
import { routeMeta } from './routes/RouteMeta';
import { AppRoutes } from './routes/AppRoutes';
import AppLayout from './layout/Main/MainLayout';
import EnvLogger from './components/Logger/EnvLogger';

export default function App() {
  const location = useLocation();

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
        <EnvLogger />
      </AppLayout>
    </div>
  );
}
