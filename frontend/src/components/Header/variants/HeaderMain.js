// src/layout/Header/HeaderMain.js

import { Link, useLocation } from 'react-router-dom';
import { GoPerson } from 'react-icons/go';
import { LuLogOut } from 'react-icons/lu';
import { IoMdArrowBack } from 'react-icons/io';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../../redux/Slice/userSlice';
import styles from '../Header.module.css';
import { axiosInstance } from '../../../api/AxiosInstance';

export default function HeaderMain({ isMainPage }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoginPage = location.pathname === '/login';
  const isHeaderWhitePage = location.pathname === '/' || isLoginPage;

  const isLogin = useSelector((state) => state.user.status);
  console.log('[HeaderMain] isLogin:', isLogin);

  const handleLogout = () => {
    axiosInstance
      .post('/member/logout', {}, { withCredentials: true })
      .finally(() => {
        dispatch(clearUser());
        window.location.href = '/';
      });
  };

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
              onClick={handleLogout}
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
