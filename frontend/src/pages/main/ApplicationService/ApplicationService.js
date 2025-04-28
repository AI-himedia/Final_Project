// src/components/main/ApplicationService.js

import style from './ApplicationService.module.css';

export default function ApplicationService() {
  return (
    <section className={style.Service_Container}>
      <div className={style.Service_Wrap}>
        <div className={style.Service_Text_Container}>
          <h3 className={style.Service_Title}>AI 기억 대화 서비스란?</h3>
          <p className={style.Service_Intro}>
            <strong>"다시, 안녕"</strong>은 고인의 생전 모습과 언어 습관을
            기반으로 학습된 AI가 남겨진 이들과{' '}
            <span className={style.highlight}>전화 또는 문자</span>를 통해
            따뜻한 대화를 이어가도록 돕는 서비스입니다.
          </p>

          <p className={style.Service_Intro}>
            AI는 생전의{' '}
            <span className={style.highlight}>목소리, 말투, 이야기, 사진</span>{' '}
            등을 바탕으로
            {/* <br /> */}
            자연스러운 흐름과 감정적 교감을 시도하며,{' '}
            <strong>다시 만난 듯한 생생한 경험</strong>을 제공합니다.
          </p>
        </div>

        <div className={style.Service_Detail_Split}>
          <div className={style.Service_Vertical_Line}></div>

          <div className={style.Service_Box}>
            <div className={style.Service_Box_Row}>
              <div className={style.Service_Box_TextArea}>
                <h4 className={style.Service_Box_Title}>문자 채팅</h4>
                <p className={style.Service_Box_Text}>
                  고인의 스타일을 반영 AI가 실시간 또는 예약된 메시지로
                  <br />
                  <span className={style.highlight}> 위로와 추억</span>을
                  전합니다.
                </p>
              </div>
              <img
                src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/Main_SubBanner_SMS.png"
                alt="문자 채팅 아이콘"
                className={style.Service_Icon}
              />
            </div>
          </div>
          <div className={style.Service_Box}>
            <div className={style.Service_Box_Row}>
              <div className={style.Service_Box_TextArea}>
                <h4 className={style.Service_Box_Title}>음성 채팅</h4>
                <p className={style.Service_Box_Text}>
                  고인의 말투와 목소리를 기반을 한 AI가{' '}
                  <span className={style.highlight}>음성 채팅</span>으로
                  사용자의 일상에 따뜻하게 말을 건넵니다.
                  {/* <br />
                    기념일 자동 발신 설정
                  </span>
                  도 가능합니다. */}
                </p>
              </div>
              <img
                src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/Main_SubBanner_voicechat.png"
                alt="음성 채팅 아이콘"
                className={style.Service_Icon}
              />
            </div>
          </div>
          <div className={style.Service_Box}>
            <div className={style.Service_Box_Row}>
              <div className={style.Service_Box_TextArea}>
                <h4 className={style.Service_Box_Title}>실시간 통화</h4>
                <p className={style.Service_Box_Text}>
                  고인과 생전에 하던 전화통화 그대로{' '}
                  <span className={style.highlight}>실시간 통화</span>를 하실 수
                  있으며, 몰입되는 대화 경험을 제공합니다.
                  {/* <br />
                    기념일 자동 발신 설정
                  </span>
                  도 가능합니다. */}
                </p>
              </div>
              <img
                src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/Main_SubBanner_Call_Icon.png"
                alt="실시간 통화 아이콘"
                className={style.Service_Icon}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
