// src/components/main/ApplicationService.js

// css
import '../../css/components/main/ApplicationService.css';

export default function ApplicationService() {
  return (
    <>
      <section className="Service_Container">
        <div className="Service_Wrap">
          <div className="Service_Text_Container">
            <h3 className="Service_Title">AI 기억 대화 서비스란?</h3>
            <p className="Service_SubTitle">
              "다시, 안녕"은 고인의 생전 모습과 언어 습관을 기반으로 학습된 AI가
              <br />
              남겨진 이들과 전화 또는 문자를 통해 따뜻한 대화를 이어갈 수 있도록
              돕는 서비스입니다.
              <br />
              <br />
              AI는 생전의 목소리, 말투, 이야기, 사진 등을 바탕으로
              <br />
              자연스러운 흐름과 감정적 교감을 시도하며, 마치 다시 만난 듯한
              생생한 경험을 제공합니다.
            </p>
          </div>

          <div className="Service_Detail_Split">
            <div className="Service_Box">
              <h4 className="Service_Box_Title">음성 전화</h4>
              <p className="Service_Box_Text">
                고인의 말투와 목소리를 기반으로 한 AI가
                <br />
                전화를 통해 사용자의 일상에 따뜻하게 말을 건넵니다.
                <br />
                특정 기념일에 맞춰 자동 발신 설정도 가능합니다.
              </p>
            </div>

            <div className="Service_Vertical_Line"></div>

            <div className="Service_Box">
              <h4 className="Service_Box_Title">문자 대화</h4>
              <p className="Service_Box_Text">
                고인의 스타일을 반영한 문자 대화 AI가
                <br />
                실시간 혹은 예약된 메시지로
                <br />
                일상 속 위로와 추억을 전합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
