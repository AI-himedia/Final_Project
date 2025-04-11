// src/pages/MainPage.js

// css
import './MainPage.global.css';

// Components
import MainBanner from './MainBanner/MainBanner.js';
import MainVideo from './MainVideo/MainVideo.js';
import { SubBanner1, SubBanner2 } from './SubBanner/SubBanner.js';
import ApplicationService from './ApplicationService/ApplicationService.js';

export default function MainPage() {
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
