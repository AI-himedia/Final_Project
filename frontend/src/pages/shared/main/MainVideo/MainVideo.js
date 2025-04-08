// src/pages/ContentSection.js

// css
import './MainVideo.web.css';
import './MainVideo.mobile.css';

export default function MainVideo() {
  return (
    <section className="MainVideo_Container">
      <div className="MainVideo_Wrap">
        <div className="Video_Wrap">
          <div className="Video_Info">
            <h3>
              AI와 나누는 추억 <br className="webOnlyBr" />
              다시, 안녕
            </h3>
            <p>
              "다시, 안녕"은 소중한 사람과의 아름다운 추억을
              <br className="mobileOnlyBr" />
              AI를 통해
              <br className="webOnlyBr" />
              다시 만나고, 따뜻한 대화로 추억을
              <br className="mobileOnlyBr" />
              공유할 수 있는 서비스입니다.
            </p>
          </div>
          <div className="Video_Box">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              // frameBorder="0"
              height="100%"
              src="https://www.youtube.com/embed/0FG_prdIPWM"
              title="YouTube video player"
              width="100%"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
