// src/pages/MainPage.js

// css
import '../css/pages/MainPage.css';

// 라이브러리
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import MainBanner from '../components/main/MainBanner';
import MainBody from '../components/main/MainVideo';
import { SubBanner1, SubBanner2 } from '../components/main/SubBanner';
import ApplicationService from '../components/main/ApplicationService';

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
      <MainBody />
      <SubBanner1 />
      <ApplicationService />
      <SubBanner2 />
    </>
  );
}
