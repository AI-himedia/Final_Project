// 토스페이먼츠 V2 버전부터는 customKey 값이 필수 파라미터이니 꼭 같이 넣어주시기 바랍니다.
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

export const useTossPayment = () => {
  const handlePayment = async (selectedService) => {
    // 결제 금액 설정
    const amount = selectedService === 'sms' ? 3900 : 5000;

    // 환경 변수에서 클라이언트 키와 고객 키 가져오기
    const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY;
    const customerKey = process.env.REACT_APP_TOSS_CUSTOMER_KEY;

    // TossPayments SDK 로드
    const tossPayments = await loadTossPayments(clientKey);

    // 결제 객체 생성
    const payment = tossPayments.payment({ customerKey });

    // 결제 요청
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
