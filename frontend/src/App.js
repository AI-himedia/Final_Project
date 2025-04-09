// src/App.js

import './App.css';
import { useLocation } from 'react-router-dom';
import { routeMeta } from './routes/RouteMeta';
import { AppRoutes } from './routes/AppRoutes';
import AppLayout from './layout/AppLayout';

export default function App() {
  const location = useLocation();
  const meta = routeMeta[location.pathname] || {
    showHeader: true,
    showFooter: true,
    showSidebar: true,
    showUpButton: true,
  };

  return (
    <div className={`App ${meta.showFooter ? 'hasFooter' : ''}`}>
      <AppLayout meta={meta}>
        <AppRoutes />
      </AppLayout>
    </div>
  );
}
