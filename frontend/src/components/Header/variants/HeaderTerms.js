// src/layout/Header/HeaderTerms.js

import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import styles from '../Header.module.css';

export default function HeaderTerms({ isTermsAgreed }) {
  const navigate = useNavigate();

  return (
    <header className={`${styles.Header_Container} ${styles.Header_Default}`}>
      <div className={styles.Header_Inner}>
        <button
          className={`${styles.Header_LoginButton} ${styles.Header_Black}`}
          onClick={() => navigate('/service')}
        >
          <IoMdArrowBack fontSize="medium" />
        </button>

        <button
          className={`${styles.Header_PaymentButton} ${
            isTermsAgreed ? styles.active : ''
          }`}
          onClick={() => navigate('/service/terms/product')}
          disabled={!isTermsAgreed}
        >
          다음
        </button>
      </div>
    </header>
  );
}
