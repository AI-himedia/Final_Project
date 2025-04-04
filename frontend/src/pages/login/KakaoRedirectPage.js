import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleKakaoLoginRedirect } from '../../api/KakaoApi';
import { useDispatch } from 'react-redux';

export default function KakaoRedirectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const runLogin = async () => {
      try {
        await handleKakaoLoginRedirect(dispatch); // dispatch 전달
        navigate('/'); // 로그인 성공 시 홈으로
      } catch (err) {
        navigate('/login'); // 실패 시 로그인 페이지로
      }
    };
    runLogin();
  }, [dispatch, navigate]);

  return <div>카카오 로그인 처리 중...</div>;
}
