import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Product.mobile.css';
import { HeaderProduct } from '../../../components/Header/variants';

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const [selectedService, setSelectedService] = useState(null);

  const servicesParam = searchParams.get('services');
  const deceasedCode = searchParams.get('deceasedCode');
  const disabledServices = servicesParam
    ? servicesParam.split(',').map(Number)
    : [];

  const isSmsDisabled = disabledServices.includes(1);
  const isVoiceChatDisabled = disabledServices.includes(2);
  const isCallDisabled = disabledServices.includes(3);

  const handleServiceClick = (type) => {
    if (
      (type === 'sms' && isSmsDisabled) ||
      (type === 'voice_chat' && isVoiceChatDisabled) ||
      (type === 'call' && isCallDisabled)
    )
      return;

    setSelectedService(type);

    // 로컬스토리지 저장 로직
    const serviceMap = {
      sms: 1,
      voice_chat: 2,
      call: 3,
    };

    const serviceCode = serviceMap[type];

    // const serviceCode = type === 'sms' ? 1 : type === 'voice_chat' ? 2 : 3;

    if (deceasedCode) {
      localStorage.setItem('@againhello/deceased-code', deceasedCode);
      localStorage.setItem('@againhello/service-code', serviceCode);
    }

    // 결제 금액 설정
    let paymentAmount = 0;
    if (type === 'sms') {
      paymentAmount = 3900;
    } else if (type === 'voice_chat') {
      paymentAmount = 5000;
    } else if (type === 'call') {
      paymentAmount = 10000;
    }

    console.log('결제 금액:', paymentAmount);
  };

  return (
    <>
      <HeaderProduct selectedService={selectedService} />

      <div className="PaymentNotice_Container">
        {/* 문자 서비스 카드 */}
        <div
          className={`Notice_Card ${
            selectedService === 'sms' ? 'selected' : ''
          } ${isSmsDisabled ? 'disabled' : ''}`}
          onClick={() => handleServiceClick('sms')}
        >
          <div className="Notice_Left">
            <img
              src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/product_sms.png"
              alt="서비스 아이콘"
              className="Notice_Icon"
            />
            <div className="Notice_TextBox">
              <h3 className="Notice_Title">문자채팅 서비스 요금</h3>
              <p className="Notice_Description">
                월 3,900원으로 문자
                <br />
                서비스를 이용할 수 있어요.
              </p>
            </div>
          </div>
          <div className="Notice_Right">
            <div
              className={`Notice_Tag ${
                isSmsDisabled ? 'Unavailable' : 'Available'
              }`}
            >
              {isSmsDisabled ? '이미 신청됨' : '신청가능'}
            </div>
          </div>
        </div>

        {/* 음챗 서비스 카드 */}
        <div
          className={`Notice_Card ${
            selectedService === 'voice_chat' ? 'selected' : ''
          } ${isVoiceChatDisabled ? 'disabled' : ''}`}
          onClick={() => handleServiceClick('voice_chat')}
        >
          <div className="Notice_Left">
            <img
              src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/product_voice-chat.png"
              alt="서비스 아이콘"
              className="Notice_Icon"
            />
            <div className="Notice_TextBox">
              <h3 className="Notice_Title">음성채팅 서비스 요금</h3>
              <p className="Notice_Description">
                월 5,000원으로 음성 채팅
                <br />
                서비스를 이용할 수 있어요.
              </p>
            </div>
          </div>
          <div className="Notice_Right">
            <div
              className={`Notice_Tag ${
                isVoiceChatDisabled ? 'Unavailable' : 'Available'
              }`}
            >
              {isVoiceChatDisabled ? '이미 신청됨' : '신청가능'}
            </div>
          </div>
        </div>

        {/* 통화 서비스 카드 */}
        <div
          className={`Notice_Card ${
            selectedService === 'call' ? 'selected' : ''
          } ${isCallDisabled ? 'disabled' : ''}`}
          onClick={() => handleServiceClick('call')}
        >
          <div className="Notice_Left">
            <img
              src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/product_call.png"
              alt="서비스 아이콘"
              className="Notice_Icon"
            />
            <div className="Notice_TextBox">
              <h3 className="Notice_Title">통화 서비스 요금</h3>
              <p className="Notice_Description">
                월 10,000원으로 통화
                <br />
                서비스를 이용할 수 있어요.
              </p>
            </div>
          </div>
          <div className="Notice_Right">
            <div
              className={`Notice_Tag ${
                isCallDisabled ? 'Unavailable' : 'Available'
              }`}
            >
              {isCallDisabled ? '이미 신청됨' : '신청가능'}
            </div>
          </div>
        </div>

        <p className="Notice_FooterText">
          * 고인 한 분당 최대 3개 서비스를 이용하실 수 있으며,
          <br />
          서비스 1개씩 따로 결제 및 신청 해주시기 바랍니다.
        </p>
      </div>
    </>
  );
}
