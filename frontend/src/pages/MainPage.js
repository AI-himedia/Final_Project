// src/pages/MainPage.js

// css
import "../css/pages/MainPage.css";

// 라이브러리
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

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
      {/* Hero Section: 이미지 꽉 채우기 */}
      <section className="Main_AOS_Banner" data-aos="fade-in">
        <h1 className="Main_Text_Title" data-aos="fade-up">
          <strong>다시, 안녕</strong>
        </h1>
        <p
          className="Main_Text_Subtitle"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          우리가 다시 대화할 수 있는 작은 기적
        </p>
      </section>

      {/* AOS 콘텐츠 */}
      <section data-aos="fade-down" className="content-section">
        고인을 기억하는 공간입니다.
      </section>

      {/* 라이브러리 */}
      <div
        className="Main_AOS_Icon_ScrollIndicator"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <div className="Main_AOS_Icon"></div>
      </div>

      {/* body */}
      <div className="Main_Body_Container"></div>
    </>
  );
}
