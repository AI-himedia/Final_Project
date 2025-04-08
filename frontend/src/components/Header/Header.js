// src/components/Header.js

import './Header.web.css';
import './Header.mobile.css';

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { GoPerson } from 'react-icons/go';
import { LuLogOut } from 'react-icons/lu';

import { IoMdArrowBack } from 'react-icons/io';

export default function Header({ isMainPage, isLogin, onLogout }) {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLoginPage = location.pathname === '/login';
  const isHeaderWhitePage = location.pathname === '/' || isLoginPage;

  return (
    <header
      className={`Header_Container ${
        isHeaderWhitePage ? 'Header_Main' : 'Header_Default'
      } ${isLoginPage ? 'Header_LoginPage' : ''}`}
    >
      <div className="Header_Inner">
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

        {/* <ul className="Header_Menu">
          <li>기억의 연대기</li>
          <li>마음의 정원</li>
          <li>우리의 안녕</li>
          <li>기억 앨범</li>
          <li>고인의 이야기</li>
        </ul> */}

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
      </div>
    </header>
  );
}
