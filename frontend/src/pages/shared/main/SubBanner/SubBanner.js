// src/pages/main/SubBanner.js

// css
import './SubBanner.web.css';
import './SubBanner.mobile.css';

// 라이브러리

export function SubBanner1() {
  return (
    <>
      <section className="SubBanner_Container">
        <div className="SubBanner_Wrap">
          <div className="SubBanner1_Section_bg"></div>
          <div className="SubBanner1_Section_bg_color"></div>

          <div className="SubBanner_Content">
            <h2>
              <strong>그리운 이름을 다시 불러봅니다</strong>
            </h2>
            <p>
              마음속 깊이 간직했던 기억들이
              <br />
              다시 따뜻한 목소리로 되살아납니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function SubBanner2() {
  return (
    <>
      <section className="SubBanner_Container">
        <div className="SubBanner_Wrap">
          <div className="SubBanner2_Section_bg"></div>
          <div className="SubBanner2_Section_bg_color"></div>

          <div className="SubBanner_Content">
            <h2>
              <strong>시간을 넘어 이어지는 대화</strong>
            </h2>
            <p>
              말하지 못했던 이야기,
              <br />
              지금 이 순간 다시 전할 수 있어요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
