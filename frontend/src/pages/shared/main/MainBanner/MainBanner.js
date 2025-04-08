// src/components/HeroSection.js

// css
import './MainBanner.web.css';
import './MainBanner.mobile.css';

export default function MainBanner() {
  return (
    <section className="Main_AOS_Banner">
      <h1 className="Main_Text_Title">
        <strong>다시, 안녕</strong>
      </h1>
      <p className="Main_Text_Subtitle">우리가 다시 대화할 수 있는 작은 기적</p>

      {/* 라이브러리 */}
      <div className="Main_AOS_Icon_ScrollIndicator">
        <div className="Main_AOS_Icon"></div>
      </div>
    </section>
  );
}
