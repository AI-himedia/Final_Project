// src/pages/shared/auth/LoginPage.js
import styles from './LoginPage.module.css';
import { kakaoLoginRedirect } from '../../../api/auth/KakaoApi';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      setLoading(true);
      window.history.replaceState({}, document.title, location.pathname);

      kakaoLoginRedirect(code)
        .then(({ status, email }) => {
          if (status === 202) {
            navigate(`/signup?email=${email}`, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        })
        .catch((error) => {
          console.error('[LoginPage] 로그인 실패', error);
          setErrorMessage(error.message || '로그인에 실패했습니다.');
          navigate('/login-error', { replace: true });
        })
        .finally(() => {
          setLoading(false); // 로딩 종료
        });
    }
  }, [location.search, navigate]);

  const handleKakaoLogin = () => {
    const clientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
    // const redirectUri = encodeURIComponent('http://localhost:3000/login');
    const redirectUri = encodeURIComponent('https://againhello.site/login');

    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = kakaoUrl;
  };

  return (
    <div className={styles.Login_Container}>
      <div className={styles.Login_Text_Wrapper}>
        <h1 className={styles.Login_Text_Title}>
          <strong>다시, 안녕</strong>
        </h1>
      </div>

      <div className={styles.Social_Login}>
        <button
          className={styles.Social_Login_Button}
          onClick={handleKakaoLogin}
          disabled={loading}
        >
          카카오로 로그인
          <img
            src="/assets/btn_kakao.svg"
            className={styles.Social_Login_Logo}
            alt="Kakao Login"
          />
        </button>
        <p className={styles.Social_Login_Description}>
          카카오 계정으로 간편하게 시작하세요
        </p>
      </div>
    </div>
  );
}
