// src/components/Footer.js
import './Footer.mobile.css';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { GoHomeFill } from 'react-icons/go';
import { PiPhoneCallLight } from 'react-icons/pi';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { CgAddR } from 'react-icons/cg';
import { GoPerson } from 'react-icons/go';
import { Toast } from '../../utils/Swal';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleCallClick = () => {
    navigate('/service/list', {
      state: { serviceType: 'call', showModal: true },
    });
  };

  const handleSmsClick = () => {
    navigate('/service/list/sms', { state: { serviceType: 'sms' } });
  };

  const handleErrorClick = () => {
    Toast.fire({
      icon: 'error',
      title: '준비 중인 서비스입니다.',
    });
  };

  return (
    <footer className="Footer_Container">
      <Link
        to="/"
        className={`Footer_Item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <GoHomeFill />
      </Link>
      <div
        className={`Footer_Item ${
          location.pathname.startsWith('/service/list') ? 'active' : ''
        }`}
        onClick={handleCallClick}
        style={{ cursor: 'pointer' }}
      >
        <PiPhoneCallLight />
      </div>
      <div
        className={`Footer_Item ${
          location.pathname.startsWith('/service/list/sms') ? 'active' : ''
        }`}
        onClick={handleSmsClick}
        style={{ cursor: 'pointer' }}
      >
        <IoChatbubblesOutline />
      </div>
      <Link
        to="/service"
        className={`Footer_Item ${
          location.pathname === '/service' ? 'active' : ''
        }`}
      >
        <CgAddR />
      </Link>
      <div
        className={`Footer_Item`}
        onClick={handleErrorClick}
        style={{ cursor: 'pointer' }}
      >
        <GoPerson />
      </div>
    </footer>
  );
}
