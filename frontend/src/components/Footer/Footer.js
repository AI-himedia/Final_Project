// src/components/Footer.js

// css
import './Footer.mobile.css';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { axiosInstance } from '../../api/AxiosInstance';

import { GoHomeFill } from 'react-icons/go';
import { PiPhoneCallLight } from 'react-icons/pi';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { CgAddR } from 'react-icons/cg';
import { GoPerson } from 'react-icons/go';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const userCode = useSelector((state) => state.user.user?.userCode);

  const handleCallClick = async () => {
    try {
      const response = await axiosInstance.get(
        `/call/user/${userCode}/deceased-list`
      );
      console.log('전화 리스트 API 응답:', response.data);
      navigate('/service/list/call', { state: { callList: response.data } });
    } catch (error) {
      console.error('전화 리스트 API 호출 오류:', error);
    }
  };

  const handleSmsClick = async () => {
    try {
      const response = await axiosInstance.get(`/sms/init-check/${userCode}`);
      console.log('SMS 초기 확인 API 응답:', response.data);
      navigate('/service/list/sms', { state: { smsResult: response.data } });
    } catch (error) {
      console.error('SMS 초기 확인 API 호출 오류:', error);
    }
  };

  return (
    <footer className="Footer_Container">
      <Link
        to="/"
        className={`Footer_Item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <GoHomeFill />
        {/* <span>홈</span> */}
      </Link>
      <div
        className={`Footer_Item ${
          location.pathname.startsWith('/service/list/call') ? 'active' : ''
        }`}
        onClick={handleCallClick}
        style={{ cursor: 'pointer' }}
      >
        <PiPhoneCallLight />
        {/* <span>통화</span> */}
      </div>
      <div
        className={`Footer_Item ${
          location.pathname.startsWith('/service/list/sms') ? 'active' : ''
        }`}
        onClick={handleSmsClick}
        style={{ cursor: 'pointer' }}
      >
        <IoChatbubblesOutline />
        {/* <span>채팅</span> */}
      </div>
      <Link
        to="/service"
        className={`Footer_Item ${
          location.pathname === '/service' ? 'active' : ''
        }`}
      >
        <CgAddR />
        {/* <span>서비스 신청</span> */}
      </Link>
      <div
        className={`Footer_Item ${
          location.pathname.startsWith('/service/list/sms') ? 'active' : ''
        }`}
        onClick={handleSmsClick}
        style={{ cursor: 'pointer' }}
      >
        <GoPerson />
        {/* <span>테스트</span> */}
      </div>
    </footer>
  );
}
