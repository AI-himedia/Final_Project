// src/routes/AppRoutes.js
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// 일반 페이지
import MainPage from '../pages/main/MainPage';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage/SignUpPage';

// 서비스 이용 페이지
import ServiceList from '../pages/service/ServiceList';
import ChatPage from '../pages/service/sms/ChatPage';
import VoiceChatPage from '../pages/service/VoiceChat/VoiceChatPage';
import CallPage from '../pages/service/Call/CallPage';

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
import Step7_AudioPreview from '../pages/DeceasedProfile/Step7_AudioPreview';
import Step7_SMS from '../pages/DeceasedProfile/Step7_SmsPreview';

// 결제
import SuccessPage from '../pages/payment/SuccessPage';

// 관리자
import AdminPage from '../pages/admin/AdminPage';

export const AppRoutes = () => (
  <Routes>
    {/* 공개 접근 라우트 */}
    <Route path="/" element={<MainPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />

    {/* 관리자 페이지 */}
    <Route path="/admin" element={<AdminPage />} />

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
    <Route path="/deceased/profile/step7-sms" element={<Step7_SMS />} />
    <Route
      path="/deceased/profile/step7-call"
      element={<Step7_AudioPreview />}
    />

    {/* 통화서비스 */}
    <Route path="/sms/chat" element={<ChatPage />} />
    <Route path="/voice-chat" element={<VoiceChatPage />} />
    <Route path="/call" element={<CallPage />} />

    {/* 인증 필요 라우트 */}
    <Route element={<PrivateRoute />}>
      <Route path="/service/list" element={<ServiceList />} />
      <Route path="/service/list/sms" element={<ServiceList />} />
      <Route path="/service/list/voice-chat" element={<ServiceList />} />
      <Route path="/service/list/call" element={<ServiceList />} />

      <Route path="/service/terms/check" element={<ServiceCheck />} />
      <Route path="/service/terms/product" element={<ProductPage />} />
    </Route>

    {/* 결제 성공 페이지 */}
    <Route path="/success" element={<SuccessPage />} />

    {/* 실패 시 리디렉션 */}
    <Route
      path="/fail"
      element={<Navigate to="/service/terms/product" replace />}
    />
  </Routes>
);
