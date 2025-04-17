// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import MainPage from '../pages/main/MainPage';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage/SignUpPage';

import ApplyPage from '../pages/service-apply/ApplyPage/ApplyPage';

import TermsOfServicePage from '../pages/service-apply/TermsOfServicePage/TermsOfServicePage';
import ProductPage from '../pages/service-apply/ProductPage/ProductPage';
import ServiceCheck from '../pages/service-apply/ServiceCheck/ServiceCheck';

import ConnectionTestPage from '../test/ConnectionTestPage';
// import RealTimeAudioStream from '../test/RealTimeAudioStream';
import TTSAudioPlayer from '../test/TTSAudioPlayer';
import CallService from '../test/CallService';
import ChatTestPage from '../test/ChatTestPage';

import DeceasedName from '../pages/DeceasedProfile/DeceasedName';
import SuccessPage from '../pages/payment/SuccessPage';

import AudioSender from '../test/AudioSender';

export const AppRoutes = () => (
  <Routes>
    {/* 공개 접근 라우트 */}
    <Route path="/" element={<MainPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />

    <Route path="/service" element={<ApplyPage />} />
    <Route path="/service/terms" element={<TermsOfServicePage />} />

    <Route path="/deceased/profile/name" element={<DeceasedName />} />

    {/* 인증 필요 라우트 */}
    <Route element={<PrivateRoute />}>
      <Route path="/service/terms/check" element={<ServiceCheck />} />
      <Route path="/service/terms/product" element={<ProductPage />} />

      <Route path="/service/check" element={<ServiceCheck />} />
    </Route>

    {/* 테스트 라우트 */}
    <Route path="/test" element={<ConnectionTestPage />} />
    <Route path="/wstest" element={<AudioSender />} />
    <Route path="/ttstest" element={<TTSAudioPlayer />} />
    <Route path="/call" element={<CallService />} />
    <Route path="/chattest" element={<ChatTestPage />} />

    {/* 리디렉션 */}
    <Route path="/success" element={<SuccessPage />} />
    {/* <Route
      path="/success"
      element={<Navigate to="/deceased-profile" replace />}
    /> */}
    <Route
      path="/fail"
      element={<Navigate to="/service/terms/product" replace />}
    />

    {/* 공개 테스트용 라우트 */}
    <Route path="/test" element={<ConnectionTestPage />} />
    <Route path="/wstest" element={<AudioSender />} />
    <Route path="/ttstest" element={<TTSAudioPlayer />} />
    <Route path="/call" element={<CallService />} />
    <Route path="/chattest" element={<ChatTestPage />} />
  </Routes>
);
