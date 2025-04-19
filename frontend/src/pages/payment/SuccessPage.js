import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SuccessPage.module.css';
import { axiosInstance } from '../../api/AxiosInstance';
import { useSelector } from 'react-redux';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userCode = useSelector((state) => state.user.user?.userCode);

  // zustand에서 setter 가져오기
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

        const receiptData = {
          vaccine: '결제',
          manufacturer: '카드',
          lotNumber: paymentKey?.slice(-6),
          date: formattedDate,
          orderId,
          country: '대한민국',
          agency: 'TossPayments',
          status: '결제완료',
          amount,
        };

        setReceipt(receiptData);

        const requestParams = {
          userCode,
          serviceCode,
        };

        if (deceasedCode && deceasedCode !== 'null') {
          requestParams.deceasedCode = deceasedCode;
        }

        await axiosInstance.post('/subscription/subscribe', null, {
          params: requestParams,
        });

        const receiptRequestParams = {
          userCode,
        };

        if (deceasedCode && deceasedCode !== 'null') {
          receiptRequestParams.deceasedCode = deceasedCode;
        }

        const deceasedResponse = await axiosInstance.get(
          '/subscription/deceased',
          {
            params: receiptRequestParams,
          }
        );

        // zustand에 고인 프로필 저장
        setDeceasedProfile(deceasedResponse.data);

        console.log('신청된 고인 서비스 정보:', deceasedResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('결제 처리 오류', error);
        setError('결제 처리 중 문제가 발생했습니다.');
        setLoading(false);
      }
    };

    processPayment();
  }, [location, userCode, setDeceasedProfile]);

  const handleConfirm = () => {
    navigate('/deceased/profile/step1');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error}</div>
        <button className={styles.confirmButton} onClick={handleConfirm}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <img src="/assets/payments.png" alt="체크" className={styles.checkIcon} />

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
