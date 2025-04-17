// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// 일반 페이지
import MainPage from '../pages/main/MainPage';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage/SignUpPage';

// 서비스 신청 관련
import ApplyPage from '../pages/service-apply/ApplyPage/ApplyPage';
import TermsOfServicePage from '../pages/service-apply/TermsOfServicePage/TermsOfServicePage';
import ProductPage from '../pages/service-apply/ProductPage/ProductPage';
import ServiceCheck from '../pages/service-apply/ServiceCheck/ServiceCheck';

// 고인 프로필
import Step1_Name from '../pages/DeceasedProfile/Step1_BasicInfo';

// 결제
import SuccessPage from '../pages/payment/SuccessPage';

// 테스트 페이지
import ConnectionTestPage from '../test/ConnectionTestPage';
import AudioSender from '../test/AudioSender';
import TTSAudioPlayer from '../test/TTSAudioPlayer';
import CallService from '../test/CallService';
import ChatTestPage from '../test/ChatTestPage';

export const AppRoutes = () => (
  <Routes>
    {/* 공개 접근 라우트 */}
    <Route path="/" element={<MainPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />

    {/* 서비스 신청 관련 */}
    <Route path="/service" element={<ApplyPage />} />
    <Route path="/service/terms" element={<TermsOfServicePage />} />

    {/* 고인 프로필 입력 */}
    <Route path="/deceased/profile/step1" element={<Step1_Name />} />

    {/* 인증 필요 라우트 */}
    <Route element={<PrivateRoute />}>
      <Route path="/service/terms/check" element={<ServiceCheck />} />
      <Route path="/service/terms/product" element={<ProductPage />} />
    </Route>

    {/* 결제 성공 페이지 */}
    <Route path="/success" element={<SuccessPage />} />

    {/* 테스트용 라우트 */}
    <Route path="/test" element={<ConnectionTestPage />} />
    <Route path="/wstest" element={<AudioSender />} />
    <Route path="/ttstest" element={<TTSAudioPlayer />} />
    <Route path="/call" element={<CallService />} />
    <Route path="/chattest" element={<ChatTestPage />} />

    {/* 실패 시 리디렉션 */}
    <Route
      path="/fail"
      element={<Navigate to="/service/terms/product" replace />}
    />
  </Routes>
);
