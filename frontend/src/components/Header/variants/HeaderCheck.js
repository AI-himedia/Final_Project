// src/layout/Header/HeaderTerms.js

import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import styles from '../Header.module.css';

export default function HeaderCheck() {
  const navigate = useNavigate();

  return (
    <header className={`${styles.Header_Container} ${styles.Header_Default}`}>
      <div className={styles.Header_Inner}>
        <button
          className={`${styles.Header_LoginButton} ${styles.Header_Black}`}
          onClick={() => navigate('/service/terms')}
        >
          <IoMdArrowBack fontSize="medium" />
        </button>
        {/* 가운데 텍스트 */}
        <div className={styles.Header_Title}>신청 내역</div>
        {/* 오른쪽 버튼 */}
        <div style={{ width: '30px' }} />
      </div>
    </header>
  );
}
