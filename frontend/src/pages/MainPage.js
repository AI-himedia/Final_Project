// src/pages/MainPage.js

// css
import '../css/web/pages/MainPage.css';

// React
import { useEffect } from 'react';

// Components
import MainBanner from '../components/main/MainBanner';
import MainVideo from '../components/main/MainVideo';
import { SubBanner1, SubBanner2 } from '../components/main/SubBanner';
import ApplicationService from '../components/main/ApplicationService';

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
