// src/components/Header/Header.js
import './Header.web.css';
import './Header.mobile.css';

import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoPerson } from 'react-icons/go';
import { LuLogOut } from 'react-icons/lu';
import { IoMdArrowBack } from 'react-icons/io';

export default function Header({
  isMainPage,
  isLogin,
  onLogout,
  isTermsAgreed,
  selectedService,
}) {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isProductPage = location.pathname === '/service/product';
  const isTermsPage = location.pathname === '/service/terms';
  const isHeaderWhitePage = location.pathname === '/' || isLoginPage;

  const isServiceSelected = !!selectedService;

  const getAmount = () => {
    if (selectedService === 'sms') return 3900;
    if (selectedService === 'call') return 5000;
    return 0;
  };

  const handlePayment = async () => {
    const amount = getAmount();
    const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
    const customerKey = 'c5c62f31-7b3c-41f6-8c0e-123456789abc';

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
      card: {
        flowMode: 'DEFAULT',
      },
    });
  };

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className={`Header_Container ${
        isHeaderWhitePage ? 'Header_Main' : 'Header_Default'
      } ${isLoginPage ? 'Header_LoginPage' : ''}`}
    >
      <div className="Header_Inner">
        {isProductPage ? (
          <>
            {/* 뒤로가기 버튼 */}
            <button
              className={`Header_LoginButton ${
                isHeaderWhitePage ? 'Header_White' : 'Header_Black'
              }`}
              onClick={() => navigate(-1)}
              title="이전 페이지"
            >
              <IoMdArrowBack fontSize="medium" />
            </button>

            {/* 결제 버튼 */}
            <button
              className={`Header_PaymentButton ${
                isServiceSelected ? 'active' : ''
              }`}
              onClick={handlePayment}
              disabled={!isServiceSelected}
            >
              결제하기
            </button>
          </>
        ) : isTermsPage ? (
          <>
            {/* 약관 동의 페이지 - 뒤로가기 + 다음 */}
            <button
              className={`Header_LoginButton ${
                isHeaderWhitePage ? 'Header_White' : 'Header_Black'
              }`}
              onClick={() => navigate(-1)}
              title="이전 페이지"
            >
              <IoMdArrowBack fontSize="medium" />
            </button>

            <button
              className={`Header_PaymentButton ${
                isTermsAgreed ? 'active' : ''
              }`}
              onClick={() => navigate('/service/product')}
              disabled={!isTermsAgreed}
            >
              다음
            </button>
          </>
        ) : (
          <>
            {/* 일반 페이지 - 로고 */}
            {!isLoginPage && (
              <Link to="/">
                <div
                  className={`Header_Logo ${
                    isHeaderWhitePage ? 'Header_White' : 'Header_Black'
                  }`}
                >
                  다시, 안녕
                </div>
              </Link>
            )}

            {/* 로그인 / 로그아웃 */}
            <div className="Header_Actions">
              {isLoginPage ? (
                <Link to="/">
                  <button
                    className={`Header_LoginButton ${
                      isHeaderWhitePage ? 'Header_White' : 'Header_Black'
                    }`}
                    title="홈으로"
                  >
                    <IoMdArrowBack fontSize="medium" />
                  </button>
                </Link>
              ) : isLogin ? (
                <button
                  onClick={onLogout}
                  className={`Header_LoginButton ${
                    isMainPage ? 'Header_White' : 'Header_Black'
                  }`}
                  title="로그아웃"
                >
                  <LuLogOut fontSize="medium" />
                </button>
              ) : (
                <Link to="/login">
                  <button
                    className={`Header_LoginButton ${
                      isMainPage ? 'Header_White' : 'Header_Black'
                    }`}
                    title="로그인"
                  >
                    <GoPerson fontSize="medium" />
                  </button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
