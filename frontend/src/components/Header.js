// src/components/Header.js

import '../css/web/components/Header.css';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import axiosInstance from '../api/AxiosInstance';

export default function Header({ isMainPage, isLogin }) {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/member/logout');
      navigate('/');
      window.location.reload(); // 로그아웃 후 상태 반영
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <header
      className={`Header_Container ${
        isMainPage ? 'Header_Main' : 'Header_Default'
      }`}
    >
      <div className="Header_Inner">
        <Link to="/">
          <div
            className={`Header_Logo ${
              isMainPage ? 'Header_White' : 'Header_Black'
            }`}
          >
            다시, 안녕
          </div>
        </Link>

        <ul className="Header_Menu">
          <li>기억의 연대기</li>
          <li>마음의 정원</li>
          <li>우리의 안녕</li>
          <li>기억 앨범</li>
          <li>고인의 이야기</li>
        </ul>

        <div className="Header_Actions">
          {isLogin ? (
            <button
              onClick={handleLogout}
              className={`Header_LoginButton ${
                isMainPage ? 'Header_White' : 'Header_Black'
              }`}
              title="로그아웃"
            >
              <LogoutIcon fontSize="medium" />
            </button>
          ) : (
            <Link to="/login">
              <button
                className={`Header_LoginButton ${
                  isMainPage ? 'Header_White' : 'Header_Black'
                }`}
                title="로그인"
              >
                <PersonOutlineIcon fontSize="medium" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
