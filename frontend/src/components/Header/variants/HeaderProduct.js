// src/layout/Header/HeaderProduct.js

import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { useTossPayment } from '../../../hooks/useTossPayment';
import styles from '../Header.module.css';

export default function HeaderProduct({ selectedService }) {
  const navigate = useNavigate();
  const { handlePayment } = useTossPayment();
  const isServiceSelected = !!selectedService;

  const handlePaymentClick = () => {
    if (isServiceSelected) {
      // 결제 금액 계산
      let paymentAmount = 0;

      if (selectedService === 'sms') {
        paymentAmount = 3900;
      } else if (selectedService === 'voice_chat') {
        paymentAmount = 5000;
      } else if (selectedService === 'call') {
        paymentAmount = 10000;
      }

      // 결제 금액 로그로 출력
      console.log('결제 금액:', paymentAmount);

      // 결제 처리
      handlePayment(selectedService);
    }
  };

  return (
    <header className={`${styles.Header_Container} ${styles.Header_Default}`}>
      <div className={styles.Header_Inner}>
        <button
          className={`${styles.Header_LoginButton} ${styles.Header_Black}`}
          onClick={() => navigate('/service/terms/check')}
          title="이전 페이지"
        >
          <IoMdArrowBack fontSize="medium" />
        </button>

        <button
          className={`${styles.Header_PaymentButton} ${
            isServiceSelected ? styles.active : ''
          }`}
          onClick={handlePaymentClick}
          disabled={!isServiceSelected}
        >
          결제하기
        </button>
      </div>
    </header>
  );
}
