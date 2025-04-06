import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKakaoLoginLink } from '../../api/KakaoApi';
import axiosInstance from '../../api/AxiosInstance';
import '../../css/pages/login/LoginPage.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false); // 로딩 상태 관리
  const navigate = useNavigate();

  const handleKakaoLogin = async () => {
    try {
      setLoading(true); // 로딩 시작

      // 카카오 로그인 링크로 이동
      const link = getKakaoLoginLink();
      window.location.href = link; // 카카오 로그인 페이지로 이동
    } catch (err) {
      setLoading(false);
      console.error('카카오 로그인 처리 오류:', err);
    }
  };

  // 카카오에서 인증 후 바로 로그인 처리하는 함수
  const handleLogin = async (code) => {
    try {
      console.log('인증 코드:', code); // 인증 코드 확인
      const res = await axiosInstance.get(
        `/api/member/kakao/token?code=${code}`
      );
      if (res.status === 200) {
        // 로그인 성공 시 메인 페이지로 바로 이동
        navigate('/', { replace: true });
      } else {
        navigate('/signup', {
          state: {
            email: res.data.email,
            oauth: 'KAKAO',
          },
        });
      }
    } catch (err) {
      console.error('로그인 처리 실패:', err);
      navigate('/login');
    }
  };

  // 페이지가 로드될 때 카카오 인증 코드 확인 및 로그인 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      handleLogin(code); // 인증 코드가 있으면 로그인 처리
    }
  }, []);

  return (
    <div className="Login_Container">
      <div className="Login_Title">Login Pages</div>
      <div className="Social_Login">
        <button
          className="Social_Login_Button"
          onClick={handleKakaoLogin}
          disabled={loading}
        >
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
