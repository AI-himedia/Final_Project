// src/App.js

// Styles
import "./App.css";

// components
import Header from "./components/Header";

// pages
import LoginPage from "./pages/LoginPage";
import ConnectionTestPage from "./pages/ConnectionTestPage";

// context
import { LoadingProvider, useLoading } from "./context/LoadingContext";

// 라이브러리
import { Route, Routes, useLocation } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import MainPage from "./pages/MainPage";
import SideMenu from "./components/SideMenu";
import UpButton from "./components/UpButton";

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
  const location = useLocation();

  // Header와 Footer를 숨길 경로 목록
  const hiddenLayoutRoutes = ["/login"];

  const isHiddenLayout = hiddenLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <LoadingProvider>
      <div className="App">
        {!isHiddenLayout ? <Header /> : <div style={{ height: "80px" }}></div>}
        <SideMenu />
        <UpButton />
        <LoadingOverlay />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<ConnectionTestPage />} />
        </Routes>
      </div>
    </LoadingProvider>
  );
}
