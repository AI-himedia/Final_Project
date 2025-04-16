// src/routes/AppRoutes.js

import { Routes, Route, Navigate } from 'react-router-dom';

import MainPage from '../pages/main/MainPage';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage/SignUpPage';

import ApplyPage from '../pages/service-apply/ApplyPage/ApplyPage';
import CallPage from '../pages/service-apply/CallPage/CallPage';
import SmsPage from '../pages/service-apply/SmsPage/SmsPage';
import TermsOfServicePage from '../pages/service-apply/TermsOfServicePage/TermsOfServicePage';
import ProductPage from '../pages/service-apply/ProductPage/ProductPage';
import ServiceCheck from '../pages/service-apply/ServiceCheck/ServiceCheck';

import ConnectionTestPage from '../test/ConnectionTestPage';
import RealTimeAudioStream from '../test/RealTimeAudioStream';
import TTSAudioPlayer from '../test/TTSAudioPlayer';
import CallService from '../test/CallService';
import ChatTestPage from '../test/ChatTestPage';
import PrivateRoute from './PrivateRoute';
import AudioSender from '../test/AudioSender';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />

    {/* Private Page */}

    <Route
      path="/service/terms/check"
      element={
        <PrivateRoute>
          <ServiceCheck />
        </PrivateRoute>
      }
    />
    <Route
      path="/service/terms/product"
      element={
        <PrivateRoute>
          <ProductPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/service/terms/product/sms"
      element={
        <PrivateRoute>
          <SmsPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/service/terms/product/call"
      element={
        <PrivateRoute>
          <CallPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/service/check"
      element={
        <PrivateRoute>
          <ServiceCheck />
        </PrivateRoute>
      }
    />

    {/* 리디렉션 */}

    <Route path="/service" element={<ApplyPage />} />
    <Route path="/service/terms" element={<TermsOfServicePage />} />

    <Route
      path="/success"
      element={<Navigate to="/service/terms/product" replace />}
    />
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
