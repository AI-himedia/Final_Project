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
          setLoading(false);
        });
    }
  }, [location.search, navigate]);

  const handleKakaoLogin = () => {
    const clientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
    // 프론트엔드 페이지가 아닌, 백엔드의 콜백 엔드포인트를 redirect_uri로 지정합니다.
    const redirectUri = encodeURIComponent(
      process.env.REACT_APP_KAKAO_REDIRECT_URI
    );

    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = kakaoUrl;
  };

  return (
    <div className={styles.Container}>
      <div className={styles.Title}>
        <h1 className={styles.Top_Title}>다시, 안녕</h1>
        <h4 className={styles.Sub_Title}>
          우리가 다시 대화할 수 있는 작은 기적
        </h4>
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
