import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TermsOfServicePage.mobile.css';

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = location.state?.service || 'sms';

  const [checkedItems, setCheckedItems] = useState({
    all: false,
    personal: false,
    deceased: false,
    payment: false,
    marketing: false,
  });

  const handleToggle = (key) => {
    if (key === 'all') {
      const newState = !checkedItems.all;
      setCheckedItems({
        all: newState,
        personal: newState,
        deceased: newState,
        payment: newState,
        marketing: checkedItems.marketing,
      });
    } else {
      const updated = { ...checkedItems, [key]: !checkedItems[key] };
      const allRequiredChecked =
        updated.personal && updated.deceased && updated.payment;

      setCheckedItems({
        ...updated,
        all: allRequiredChecked,
      });
    }
  };

  const isNextEnabled =
    checkedItems.personal && checkedItems.deceased && checkedItems.payment;

  const handleNext = () => {
    if (!isNextEnabled) return;
    navigate('/apply/form', { state: { service: serviceType } });
  };

  return (
    <div className="Terms_Container">
      {/* 헤더 */}
      <div className="Terms_Header">
        <div></div>
        <button
          className={`Terms_NextButton ${
            isNextEnabled ? 'active' : 'disabled'
          }`}
          onClick={handleNext}
        >
          다음
        </button>
      </div>

      {/* 제목 */}
      <div className="Terms_Title">
        <h1 className="Terms_Heading">
          서비스 이용을 위한
          <br />
          동의 안내
        </h1>
        <p className="Terms_Description">
          “다시, 안녕” 서비스 이용에 꼭 필요한 사항입니다.
          <br />
          아래 약관을 확인 후 동의해 주세요.
        </p>
      </div>

      {/* 체크박스 리스트 */}
      <ul className="Terms_CheckboxList">
        <li className="Terms_CheckboxItem" onClick={() => handleToggle('all')}>
          <span className="Terms_CheckboxLabel Terms_CheckboxLabel__All">
            전체 동의
          </span>
          <div
            className={`Terms_CheckboxCircle ${
              checkedItems.all ? 'checked' : ''
            }`}
          />
        </li>
        <li
          className="Terms_CheckboxItem"
          onClick={() => handleToggle('personal')}
        >
          <span className="Terms_CheckboxLabel">
            [필수] 개인정보 수집 및 이용 동의
          </span>
          <div
            className={`Terms_CheckboxCircle ${
              checkedItems.personal ? 'checked' : ''
            }`}
          />
        </li>
        <li
          className="Terms_CheckboxItem"
          onClick={() => handleToggle('deceased')}
        >
          <span className="Terms_CheckboxLabel">
            [필수] 고인 관련 데이터 제공 및 활용 동의
          </span>
          <div
            className={`Terms_CheckboxCircle ${
              checkedItems.deceased ? 'checked' : ''
            }`}
          />
        </li>
        <li
          className="Terms_CheckboxItem"
          onClick={() => handleToggle('payment')}
        >
          <span className="Terms_CheckboxLabel">
            [필수] 유료 서비스 및 자동 갱신 안내
          </span>
          <div
            className={`Terms_CheckboxCircle ${
              checkedItems.payment ? 'checked' : ''
            }`}
          />
        </li>
        <li
          className="Terms_CheckboxItem"
          onClick={() => handleToggle('marketing')}
        >
          <span className="Terms_CheckboxLabel">
            [선택] 서비스 및 감성 콘텐츠 수신 동의
          </span>
          <div
            className={`Terms_CheckboxCircle ${
              checkedItems.marketing ? 'checked' : ''
            }`}
          />
        </li>
      </ul>
    </div>
  );
}
