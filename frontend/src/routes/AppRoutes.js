// src/routes/AppRoutes.js

import { Routes, Route, Navigate } from 'react-router-dom';

import MainPage from '../pages/app/main/MainPage';
import LoginPage from '../pages/app/auth/LoginPage';
import SignUpPage from '../pages/app/auth/SignUpPage/SignUpPage';

import ApplyPage from '../pages/app/service-apply/ApplyPage/ApplyPage';
import CallPage from '../pages/app/service-apply/CallPage/CallPage';
import SmsPage from '../pages/app/service-apply/SmsPage/SmsPage';
import TermsOfServicePage from '../pages/app/service-apply/TermsOfServicePage/TermsOfServicePage';
import ProductPage from '../pages/app/service-apply/ProductPage/ProductPage';
import ServiceCheck from '../pages/app/service-apply/ServiceCheck/ServiceCheck';

import ConnectionTestPage from '../test/ConnectionTestPage';
import RealTimeAudioStream from '../test/RealTimeAudioStream';
import TTSAudioPlayer from '../test/TTSAudioPlayer';
import CallService from '../test/CallService';
import ChatTestPage from '../test/ChatTestPage';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/login" element={<LoginPage />} />

    <Route path="/signup" element={<SignUpPage />} />

    <Route path="/service" element={<ApplyPage />} />
    <Route path="/service/terms" element={<TermsOfServicePage />} />
    <Route path="/service/terms/product" element={<ProductPage />} />

    <Route path="/service/terms/product/sms" element={<SmsPage />} />
    <Route path="/service/terms/product/call" element={<CallPage />} />

    <Route path="/service/check" element={<ServiceCheck />} />

    <Route
      path="/success"
      element={<Navigate to="/service/terms/product" replace />}
    />
    <Route
      path="/fail"
      element={<Navigate to="/service/terms/product" replace />}
    />

    <Route path="/test" element={<ConnectionTestPage />} />
    <Route path="/wstest" element={<RealTimeAudioStream />} />
    <Route path="/ttstest" element={<TTSAudioPlayer />} />
    <Route path="/call" element={<CallService />} />
    <Route path="/chattest" element={<ChatTestPage />} />
  </Routes>
);
