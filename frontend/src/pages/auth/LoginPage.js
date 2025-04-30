// src/pages/shared/auth/LoginPage.js
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const handleKakaoLogin = () => {
    const clientId = process.env.REACT_APP_KAKAO_REST_API_KEY;
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
        >
          카카오로 로그인
          <img
            src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/btn_kakao.svg"
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
