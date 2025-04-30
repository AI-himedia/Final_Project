// 토스페이먼츠 V2 버전부터는 customKey 값이 필수 파라미터이니 꼭 같이 넣어주시기 바랍니다.
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useSelector } from 'react-redux';

export const useTossPayment = () => {
  // Redux 사용자 정보 추출 - 훅 레벨에서 호출
  const { fullName, email } = useSelector((state) => state.user);

  const handlePayment = async (selectedService) => {
    // 결제 금액 설정
    const amount =
      selectedService === 'sms'
        ? 3900
        : selectedService === 'voice_chat'
        ? 5000
        : 10000;

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
      orderName:
        selectedService === 'sms'
          ? '문자 채팅 서비스'
          : 'voice_chat'
          ? '음성 채팅 서비스'
          : '통화 서비스',
      customerName: fullName,
      customerEmail: email,
      successUrl: `${window.location.origin}/success`,
      failUrl: `${window.location.origin}/fail`,
    });
  };

  return { handlePayment };
};
