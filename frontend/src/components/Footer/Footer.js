// src/components/Footer.js

// css
import './Footer.mobile.css';

import { Link, useLocation } from 'react-router-dom';

import { GoHomeFill } from 'react-icons/go';
import { PiPhoneCallLight } from 'react-icons/pi';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { RxFilePlus } from 'react-icons/rx';
import { GoPerson } from 'react-icons/go';

export default function Footer() {
  const location = useLocation();

  return (
    <footer className="Footer_Container">
      <Link
        to="/"
        className={`Footer_Item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <GoHomeFill />
        <span>홈</span>
      </Link>
      <Link
        to="/call"
        className={`Footer_Item ${
          location.pathname === '/call' ? 'active' : ''
        }`}
      >
        <PiPhoneCallLight />
        <span>통화</span>
      </Link>
      <Link
        to="/chat"
        className={`Footer_Item ${
          location.pathname === '/chat' ? 'active' : ''
        }`}
      >
        <IoChatbubblesOutline />
        <span>채팅</span>
      </Link>
      <Link
        to="/apply"
        className={`Footer_Item ${
          location.pathname === '/apply' ? 'active' : ''
        }`}
      >
        <RxFilePlus />
        <span>서비스 신청</span>
      </Link>
      <Link
        to="/mypage"
        className={`Footer_Item ${
          location.pathname === '/mypage' ? 'active' : ''
        }`}
      >
        <GoPerson />
        <span>마이페이지</span>
      </Link>
    </footer>
  );
}
