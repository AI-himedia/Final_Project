// src/pages/MainPage.js

// css
import './MainPage.global.css';

// React
import { useEffect } from 'react';

// Components
import MainBanner from './MainBanner/MainBanner.js';
import MainVideo from './MainVideo/MainVideo.js';
import { SubBanner1, SubBanner2 } from './SubBanner/SubBanner.js';
import ApplicationService from './ApplicationService/ApplicationService.js';

// 라이브러리
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function MainPage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    AOS.refresh();
  }, []);

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
