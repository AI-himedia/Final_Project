import styles from './ServiceCheck.module.css';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getServiceCheck } from '../../../api/ServiceApi';

export default function ServiceCheck() {
  const userCode = useSelector((state) => state.user.user.userCode);
  const fullName = useSelector((state) => state.user.user.fullName); // fullName 가져오기

  const [hasService, setHasService] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userCode) return;

    const fetchData = async () => {
      try {
        const data = await getServiceCheck(userCode);
        setHasService(Array.isArray(data) && data.length > 0 ? data : []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [userCode]);

  const getServiceType = (code) => {
    switch (code) {
      case 1:
        return '문자 서비스';
      case 2:
        return '전화 서비스';
      default:
        return `알 수 없음 (${code})`;
    }
  };

  if (error) return <div className={styles.Error}>오류 발생: {error}</div>;

  return (
    <div className={styles.Container}>
      {fullName && <h2>{fullName} 님의 신청 내역</h2>}

      {hasService && hasService.length > 0 ? (
        <>
          <ul>
            {hasService.map((service, idx) => (
              <li key={idx}>
                <strong>{service.deceasedName}</strong> 님의 서비스 종류:{' '}
                {getServiceType(service.serviceCode)}
              </li>
            ))}
          </ul>
        </>
      ) : hasService && hasService.length === 0 ? (
        '아직 신청한 서비스가 없습니다.'
      ) : null}
    </div>
  );
}
