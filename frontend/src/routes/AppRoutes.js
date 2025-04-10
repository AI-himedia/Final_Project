// src/routes/AppRoutes.js

import { Routes, Route, Navigate } from 'react-router-dom';

import MainPage from '../pages/shared/main/MainPage';
import LoginPage from '../pages/shared/auth/LoginPage';
import SignUpPage from '../pages/shared/auth/SignUpPage/SignUpPage';
import KakaoRedirectPage from '../pages/shared/auth/KakaoRedirectPage/KakaoRedirectPage';

import ApplyPage from '../pages/app/service/ApplyPage/ApplyPage';
import CallPage from '../pages/app/service/CallPage/CallPage';
import SmsPage from '../pages/app/service/SmsPage/SmsPage';
import TermsOfServicePage from '../pages/app/service/TermsOfServicePage/TermsOfServicePage';
import ProductPage from '../pages/app/service/ProductPage/ProductPage';

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
    <Route path="/member/kakao" element={<KakaoRedirectPage />} />

    <Route path="/service" element={<ApplyPage />} />
    <Route path="/service/terms" element={<TermsOfServicePage />} />
    <Route path="/service/sms" element={<SmsPage />} />
    <Route path="/service/call" element={<CallPage />} />
    <Route path="/service/product" element={<ProductPage />} />

    <Route path="/success" element={<Navigate to="/test" replace />} />
    <Route path="/fail" element={<Navigate to="/service/product" replace />} />

    <Route path="/test" element={<ConnectionTestPage />} />
    <Route path="/wstest" element={<RealTimeAudioStream />} />
    <Route path="/ttstest" element={<TTSAudioPlayer />} />
    <Route path="/call" element={<CallService />} />
    <Route path="/chattest" element={<ChatTestPage />} />
  </Routes>
);
