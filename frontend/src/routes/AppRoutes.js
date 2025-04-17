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
import Step2_Nicknames from '../pages/DeceasedProfile/Step2_Nicknames';
import Step3_Relationship from '../pages/DeceasedProfile/Step3_Relationshop';
import Step4_Personality from '../pages/DeceasedProfile/Step4_Personality';
import Step5_SpeakingTone from '../pages/DeceasedProfile/Step5_SpeckingTone';
import Step6_Upload from '../pages/DeceasedProfile/Step6_Upload';

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
    <Route path="/deceased/profile/step2" element={<Step2_Nicknames />} />
    <Route path="/deceased/profile/step3" element={<Step3_Relationship />} />
    <Route path="/deceased/profile/step4" element={<Step4_Personality />} />
    <Route path="/deceased/profile/step5" element={<Step5_SpeakingTone />} />
    <Route path="/deceased/profile/step6" element={<Step6_Upload />} />

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
