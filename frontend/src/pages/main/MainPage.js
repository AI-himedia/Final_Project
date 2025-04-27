// src/pages/MainPage.js

// css
import './MainPage.global.css';

// Components
import MainBanner from './MainBanner/MainBanner.js';
import MainVideo from './MainVideo/MainVideo.js';
import { SubBanner1, SubBanner2 } from './SubBanner/SubBanner.js';
import ApplicationService from './ApplicationService/ApplicationService.js';
import { Toast } from '../../utils/Swal';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function MainPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.signupSuccess) {
      Toast.fire({
        icon: 'success',
        title: '회원가입이 완료되었습니다.<br/>다시 로그인해주세요.',
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <MainBanner />
      <MainVideo />
      <SubBanner1 />
      <ApplicationService />
      <SubBanner2 />
    </>
  );
}
