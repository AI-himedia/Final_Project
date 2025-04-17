// src/pages/payment/SuccessPage.js

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SuccessPage.module.css';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState({});

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId')?.replace('order-', '');
    const paymentKey = queryParams.get('paymentKey');
    const amount = queryParams.get('amount');

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
  }, [location]);

  const handleConfirm = () => {
    navigate('/deceased/profile/step1');
  };

  return (
    <div className={styles.container}>
      <img src="/assets/payments.png" alt="체크" className={styles.checkIcon} />
      {/* <h2 className={styles.title}>OO 서비스가 신청되었습니다.</h2> */}

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
