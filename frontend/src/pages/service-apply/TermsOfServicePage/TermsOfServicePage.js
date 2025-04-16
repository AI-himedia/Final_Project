// src/pages/app/service-apply/TermsOfServicePage/TermsOfServicePage.js

import { useState, useEffect } from 'react';
import Header from '../../../components/Header/variants/HeaderTerms';
import './TermsOfServicePage.mobile.css';

export default function TermsOfServicePage() {
  const [checkedItems, setCheckedItems] = useState({
    all: false,
    personal: false,
    deceased: false,
    copyright: false,
    relationship: false,
    payment: false,
    storage: false,
    marketing: false,
  });

  // 필수 항목 5개 모두 동의했는지 여부
  const isTermsAgreed =
    checkedItems.personal &&
    checkedItems.deceased &&
    checkedItems.copyright &&
    checkedItems.relationship &&
    checkedItems.payment;

  useEffect(() => {
    console.log('[DEBUG] ', isTermsAgreed);
  }, [isTermsAgreed]);

  // 체크박스 상태 토글 핸들러
  const handleToggle = (key) => {
    if (key === 'all') {
      const newState = !checkedItems.all;
      setCheckedItems({
        all: newState,
        personal: newState,
        deceased: newState,
        copyright: newState,
        relationship: newState,
        payment: newState,
        storage: newState,
        marketing: newState,
      });
    } else {
      const updated = { ...checkedItems, [key]: !checkedItems[key] };
      const allRequiredChecked =
        updated.personal &&
        updated.deceased &&
        updated.copyright &&
        updated.relationship &&
        updated.payment;
      setCheckedItems({
        ...updated,
        all: allRequiredChecked && updated.storage && updated.marketing,
      });
    }
  };

  return (
    <>
      {/* Header는 약관 동의 상태만 props로 전달 */}
      <Header isTermsAgreed={isTermsAgreed} />

      <div className="Terms_Container">
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

        <ul className="Terms_CheckboxList">
          {[
            'all',
            'personal',
            'deceased',
            'copyright',
            'relationship',
            'payment',
            'storage',
            'marketing',
          ].map((key) => (
            <li
              key={key}
              className="Terms_CheckboxItem"
              onClick={() => handleToggle(key)}
            >
              <span
                className={`Terms_CheckboxLabel ${
                  key === 'all' ? 'Terms_CheckboxLabel__All' : ''
                }`}
              >
                {key === 'all'
                  ? '전체 동의'
                  : key === 'personal'
                  ? '[필수] 개인정보 이용 동의'
                  : key === 'deceased'
                  ? '[필수] 고인 데이터 활용 동의'
                  : key === 'copyright'
                  ? '[필수] 고인 권리 사용 책임 동의'
                  : key === 'relationship'
                  ? '[필수] 고인과의 관계 확인'
                  : key === 'payment'
                  ? '[필수] 유료 서비스 안내 동의'
                  : key === 'storage'
                  ? '[선택] 고인 데이터 보관·연구 동의'
                  : '[선택] 서비스 콘텐츠 수신 동의'}
              </span>

              <div
                className={`Terms_CheckboxCircle ${
                  checkedItems[key] ? 'checked' : ''
                }`}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
