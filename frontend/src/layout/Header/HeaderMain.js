// src/layout/Header/HeaderMain.js

import { Link, useLocation } from 'react-router-dom';
import { GoPerson } from 'react-icons/go';
import { LuLogOut } from 'react-icons/lu';
import { IoMdArrowBack } from 'react-icons/io';
import styles from '../../components/Header/Header.module.css';

export default function HeaderMain({ isMainPage, isLogin, onLogout }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isHeaderWhitePage = location.pathname === '/' || isLoginPage;

  return (
    <header
      className={`${styles.Header_Container} ${
        isHeaderWhitePage ? styles.Header_Main : styles.Header_Default
      } ${isLoginPage ? styles.Header_LoginPage : ''}`}
    >
      <div className={styles.Header_Inner}>
        {!isLoginPage && (
          <Link to="/">
            <div
              className={`${styles.Header_Logo} ${
                isHeaderWhitePage ? styles.Header_White : styles.Header_Black
              }`}
            >
              다시, 안녕
            </div>
          </Link>
        )}

        <div className={styles.Header_Actions}>
          {isLoginPage ? (
            <Link to="/">
              <button
                className={`${styles.Header_LoginButton} ${
                  isHeaderWhitePage ? styles.Header_White : styles.Header_Black
                }`}
                title="홈으로"
              >
                <IoMdArrowBack fontSize="medium" />
              </button>
            </Link>
          ) : isLogin ? (
            <button
              onClick={onLogout}
              className={`${styles.Header_LoginButton} ${
                isMainPage ? styles.Header_White : styles.Header_Black
              }`}
              title="로그아웃"
            >
              <LuLogOut fontSize="medium" />
            </button>
          ) : (
            <Link to="/login">
              <button
                className={`${styles.Header_LoginButton} ${
                  isMainPage ? styles.Header_White : styles.Header_Black
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
