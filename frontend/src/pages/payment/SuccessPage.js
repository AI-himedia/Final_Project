// src/pages/SuccessPage.js
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const SuccessPage = () => {
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentType = queryParams.get('paymentType');
    const orderId = queryParams.get('orderId');
    const paymentKey = queryParams.get('paymentKey');
    const amount = queryParams.get('amount');

    console.log('결제 성공 정보:', {
      paymentType,
      orderId,
      paymentKey,
      amount,
    });

    // 여기에 amount 검증 로직도 추가 가능
  }, [location]);

  return (
    <div>
      <h1>결제 성공</h1>
    </div>
  );
};

export default SuccessPage;
