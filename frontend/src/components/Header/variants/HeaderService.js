// src/layout/Header/HeaderTerms.js

import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import styles from '../Header.module.css';

export default function HeaderService(props) {
  const navigate = useNavigate();
  const { deceasedName } = props;

  return (
    <header className={`${styles.Header_Container} ${styles.Header_Default}`}>
      <div className={styles.Header_Inner}>
        <button
          className={`${styles.Header_LoginButton} ${styles.Header_Black}`}
          onClick={() => navigate('/service/list/sms')}
        >
          <IoMdArrowBack fontSize="medium" />
        </button>
        {/* 가운데 텍스트 */}
        <div className={styles.Header_Title}>
          {deceasedName ? `故 ${deceasedName}` : '채팅창'}
        </div>
        {/* 오른쪽 버튼 */}
        <div style={{ width: '30px' }} />
      </div>
    </header>
  );
}
