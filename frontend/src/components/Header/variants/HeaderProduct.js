// src/layout/Header/HeaderProduct.js

import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { useTossPayment } from '../../../hooks/useTossPayment';
import styles from '../Header.module.css';

export default function HeaderProduct({ selectedService }) {
  const navigate = useNavigate();
  const { handleBilling } = useTossPayment();
  const isServiceSelected = !!selectedService;

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
          onClick={handleBilling}
          disabled={!isServiceSelected}
        >
          결제하기
        </button>
      </div>
    </header>
  );
}
