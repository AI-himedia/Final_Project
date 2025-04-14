import { useState } from 'react';
import Header from '../../../components/Header/Header';
import './Product.mobile.css';

export default function ProductPage() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <>
      <Header selectedService={selectedService} />

      <div className="PaymentNotice_Container">
        <div
          className={`Notice_Card ${
            selectedService === 'sms' ? 'selected' : ''
          }`}
          onClick={() => setSelectedService('sms')}
        >
          <div className="Notice_Left">
            <img
              src="/assets/product_sms.png"
              alt="서비스 아이콘"
              className="Notice_Icon"
            />
            <div className="Notice_TextBox">
              <h3 className="Notice_Title">문자 서비스 요금</h3>
              <p className="Notice_Description">
                월 3,900원으로 문자
                <br />
                서비스를 이용할 수 있어요.
              </p>
            </div>
          </div>
          <div className="Notice_Right">
            <div className="Notice_Tag">신청가능</div>
          </div>
        </div>

        <div
          className={`Notice_Card ${
            selectedService === 'call' ? 'selected' : ''
          }`}
          onClick={() => setSelectedService('call')}
        >
          <div className="Notice_Left">
            <img
              src="/assets/product_call.png"
              alt="서비스 아이콘"
              className="Notice_Icon"
            />
            <div className="Notice_TextBox">
              <h3 className="Notice_Title">통화 서비스 요금</h3>
              <p className="Notice_Description">
                월 5,000원으로 통화
                <br />
                서비스를 이용할 수 있어요.
              </p>
            </div>
          </div>
          <div className="Notice_Right">
            <div className="Notice_Tag">신청가능</div>
          </div>
        </div>

        <p className="Notice_FooterText">
          * 고인 한 분당 최대 2개 서비스를 이용하실 수 있습니다.
        </p>
      </div>
    </>
  );
}
