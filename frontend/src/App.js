// Styles
import "./App.css";

// React Router 관련 import
import { Route, Routes } from "react-router-dom";

// context
import { LoadingProvider, useLoading } from "./context/LoadingContext";

// 라이브러리
import { ScaleLoader } from "react-spinners";

/**
 * LoadingOverlay 컴포넌트
 * 로딩 중일 때 스피너를 화면에 표시
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
  return (
    <LoadingProvider>
      <div className="App">
        <LoadingOverlay />
        <Routes>
          {/* <Route path="/" element={<Home />} />
          <Route path="/result" element={<ImageDisplay />} /> */}
        </Routes>
      </div>
    </LoadingProvider>
  );
}
