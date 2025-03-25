import "../css/pages/LoginPage.css";

import { getKakaoLoginLink } from "../api/KakaoApi";
import { getNaverLoginLink } from "../api/NaverApi";
import { getGoogleLoginLink } from "../api/GoogleApi";

export default function LoginPage() {
  const handleKakaoLogin = () => {
    const link = getKakaoLoginLink();
    window.location.href = link;
  };
  const handleNaverLogin = () => {
    const link = getNaverLoginLink();
    window.location.href = link;
  };
  const handleGoogleLogin = () => {
    const link = getGoogleLoginLink();
    window.location.href = link;
  };

  return (
    <div className="Login_Container">
      <div className="Login_Title">Login Pages</div>
      <div className="Social_Login">
        <button className="Social_Login_Button" onClick={handleGoogleLogin}>
          구글로 로그인
          <img
            src="/assets/btn_google.svg"
            className="Social_Login_Logo"
            alt="Google Login"
          />
        </button>
        <button className="Social_Login_Button" onClick={handleNaverLogin}>
          네이버로 로그인
          <img
            src="/assets/btn_naver.svg"
            className="Social_Login_Logo"
            alt="Naver Login"
          />
        </button>
        <button className="Social_Login_Button" onClick={handleKakaoLogin}>
          카카오로 로그인
          <img
            src="/assets/btn_kakao.svg"
            className="Social_Login_Logo"
            alt="Kakao Login"
          />
        </button>
      </div>
    </div>
  );
}
