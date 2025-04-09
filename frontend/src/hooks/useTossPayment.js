import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

export const useTossPayment = () => {
  const handlePayment = async (selectedService) => {
    // 토스페이먼츠 V2 버전부터는 customKey 값이 필수 파라미터이니 꼭 같이 넣어주시기 바랍니다.
    const amount = selectedService === 'sms' ? 3900 : 5000;
    const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY;
    const customerKey = process.env.REACT_APP_TOSS_CUSTOMER_KEY;
    const tossPayments = await loadTossPayments(clientKey);
    const payment = tossPayments.payment({ customerKey });

    await payment.requestPayment({
      method: 'CARD',
      amount: {
        currency: 'KRW',
        value: amount,
      },
      orderId: `order-${Date.now()}`,
      orderName: selectedService === 'sms' ? '문자 서비스' : '통화 서비스',
      customerEmail: 'test@example.com',
      customerName: '홍길동',
      successUrl: `${window.location.origin}/success`,
      failUrl: `${window.location.origin}/fail`,
    });
  };

  return { handlePayment };
};
