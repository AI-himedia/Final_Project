import './PaymentNoticePage.mobile.css';
import { useNavigate } from 'react-router-dom';

import { IoMdArrowBack } from 'react-icons/io';

export default function PaymentNoticePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="PaymentNotice_Container">
        {/* Body */}
        <div className="Notice_Card">
          <div className="Notice_Left">
            <img
              src="/assets/payment_notice1.png"
              alt="서비스 아이콘"
              className="Notice_Icon"
            />
            <div className="Notice_TextBox">
              <h3 className="Notice_Title">서비스 이용 요금</h3>
              <p className="Notice_Description">
                월 3,900원으로 문자 또는
                <br />
                음성 서비스를 이용할 수 있어요.
              </p>
            </div>
          </div>

          <div className="Notice_Right">
            <div className="Notice_Tag">신청가능</div>
          </div>
        </div>
      </div>
    </>
  );
}
