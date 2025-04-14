import styles from './ServiceCheck.module.css';

// src/pages/ServiceCheck.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getServiceCheck } from '../../../../api/service/ServiceApi';

export default function ServiceCheck() {
  const userCode = useSelector((state) => state.user.code);

  useEffect(() => {
    if (!userCode) return;

    const fetchData = async () => {
      try {
        const res = await getServiceCheck(userCode);
        console.log('[DEBUG] 서비스 체크 결과:', res);
        // TODO: 필요하다면 상태에 저장 또는 화면에 렌더링
      } catch (err) {
        console.error('[ERROR] 서비스 체크 실패:', err);
      }
    };

    fetchData();
  }, [userCode]);

  return <div className={styles.Container}>ㅎㅇ</div>;
}
