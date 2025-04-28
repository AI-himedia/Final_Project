// src/pages/SuccessPage.jsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SuccessPage.module.css';
import { useSelector } from 'react-redux';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';

import { getPostSubscribe } from '../../api/ServiceApi';
import { getDeceasedProfile } from '../../api/ServiceApi';
import { useAuth } from '../../hooks/useAuth';

const SuccessPage = () => {
  const { isLoading } = useAuth();
  console.log('[zustand 결제 성공]', useDeceasedProfile.getState());

  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userCode = useSelector((state) => state.user.user?.userCode);
  const setDeceasedProfile = useDeceasedProfile(
    (state) => state.setDeceasedProfile
  );

  useEffect(() => {
    const processPayment = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('orderId')?.replace('order-', '');
        const paymentKey = queryParams.get('paymentKey');
        const amount = queryParams.get('amount');

        if (!paymentKey || !orderId || !amount) {
          setError('결제 정보가 올바르지 않습니다.');
          setLoading(false);
          return;
        }

        const deceasedCode = localStorage.getItem('@againhello/deceased-code');
        const serviceCode = localStorage.getItem('@againhello/service-code');

        if (!serviceCode) {
          setError('서비스 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${
          now.getMonth() + 1
        }-${now.getDate()} ${now.toLocaleTimeString()}`;

        setReceipt({
          vaccine: '결제',
          manufacturer: '카드',
          lotNumber: paymentKey.slice(-6),
          date: formattedDate,
          orderId,
          country: '대한민국',
          agency: 'TossPayments',
          status: '결제완료',
          amount,
        });

        const subscriptionCode = await getPostSubscribe({
          userCode,
          serviceCode,
          deceasedCode,
        });

        console.log('[SuccessPage] subscriptionCode 저장:', subscriptionCode);
        setDeceasedProfile({ subscriptionCode });
        console.log(
          '[SuccessPage] Zustand 업데이트 직후 (subscriptionCode 저장 후):',
          useDeceasedProfile.getState()
        );

        if (userCode) {
          const profileData = await getDeceasedProfile({
            userCode,
            serviceCode,
            deceasedCode,
          });

          if (profileData) {
            setDeceasedProfile({
              ...profileData,
              subscriptionCode: useDeceasedProfile.getState().subscriptionCode,
            });
            console.log(
              '[SuccessPage] Zustand 업데이트 직후 (프로필 데이터 저장 후):',
              useDeceasedProfile.getState()
            );
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('결제 처리 오류', err);
        setError('결제 처리 중 문제가 발생했습니다.');
        setLoading(false);
      }
    };

    processPayment();
  }, [location, userCode, setDeceasedProfile]); // getZustandState 제거

  const handleConfirm = () => {
    navigate('/deceased/profile/step1');
  };

  const errorConfirm = () => {
    navigate('/');
  };

  if (isLoading || loading) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error}</div>
        <button className={styles.confirmButton} onClick={errorConfirm}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <img
        src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/payments.png"
        alt="체크"
        className={styles.checkIcon}
      />

      <div className={styles.receiptBox}>
        <div className={styles.row}>
          <span className={styles.label}>항목</span>
          <span className={styles.value}>{receipt.vaccine}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>결제수단</span>
          <span className={styles.value}>{receipt.manufacturer}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>승인번호</span>
          <span className={styles.value}>{receipt.lotNumber}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>결제일시</span>
          <span className={styles.value}>{receipt.date}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>주문ID</span>
          <span className={styles.value}>{receipt.orderId}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>결제국가</span>
          <span className={styles.value}>{receipt.country}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>결제기관</span>
          <span className={styles.value}>{receipt.agency}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>상태</span>
          <span className={styles.status}>{receipt.status}</span>
        </div>
      </div>

      <button className={styles.confirmButton} onClick={handleConfirm}>
        확인
      </button>
    </div>
  );
};

export default SuccessPage;
