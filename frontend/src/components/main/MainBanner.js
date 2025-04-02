// src/components/HeroSection.js

// css
import '../../css/components/main/MainBanner.css';

export default function MainBanner() {
  return (
    <section className="Main_AOS_Banner" data-aos="fade-in">
      <h1 className="Main_Text_Title" data-aos="fade-up">
        <strong>다시, 안녕</strong>
      </h1>
      <p className="Main_Text_Subtitle" data-aos="fade-up" data-aos-delay="200">
        우리가 다시 대화할 수 있는 작은 기적
      </p>

      {/* 라이브러리 */}
      <div
        className="Main_AOS_Icon_ScrollIndicator"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <div className="Main_AOS_Icon"></div>
      </div>
    </section>
  );
}
