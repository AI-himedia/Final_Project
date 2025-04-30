// src/pages/service/ServiceList.js

import styles from '../../pages/service/ServiceCheck.module.css';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import SkeletonList from '../../components/common/SkeletonList';
import { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/AxiosInstance';

export default function ServiceList() {
  const userCode = useSelector((state) => state.user.user?.userCode);
  const fullName = useSelector((state) => state.user.user?.fullName);
  const navigate = useNavigate();
  const location = useLocation();

  const [deceasedList, setDeceasedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [serviceType, setServiceType] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [isModalConfirmed, setIsModalConfirmed] = useState(false);

  // URL 경로에 따라 기본 serviceType 설정
  useEffect(() => {
    if (location.pathname.startsWith('/service/list/sms')) {
      setServiceType('sms');
      setIsModalConfirmed(true);
      setShowOptions(false);
    } else if (location.pathname.startsWith('/service/list/call')) {
      setServiceType('call');
      setIsModalConfirmed(true);
      setShowOptions(false);
    } else if (location.pathname.startsWith('/service/list/voice-chat')) {
      setServiceType('voice_chat');
      setIsModalConfirmed(true);
      setShowOptions(false);
    } else if (location.pathname.startsWith('/service/list')) {
      setServiceType(null);
      setShowOptions(true);
      setIsModalConfirmed(false);
    } else {
      setServiceType(null);
      setShowOptions(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!userCode || !serviceType || !isModalConfirmed) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        let apiUrl = '';
        if (serviceType === 'call') {
          apiUrl = `/call/user/${userCode}/deceased-list-for-streaming`;
        } else if (serviceType === 'voice_chat') {
          apiUrl = `/call/user/${userCode}/deceased-list`;
        } else if (serviceType === 'sms') {
          apiUrl = `/sms/init-check/${userCode}`;
        }

        if (!apiUrl) return;

        const response = await axiosInstance.get(apiUrl);
        console.log(response);

        if (serviceType === 'sms') {
          setDeceasedList(response.data.subscriptionSummaryDTOList || []);
        } else {
          setDeceasedList(response.data);
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setShowSkeleton(false);
        }, 1000);
      }
    };

    fetchData();
  }, [userCode, serviceType, isModalConfirmed]);

  const handleOptionSelect = (type, deceasedName) => {
    setServiceType(type);
    setIsModalConfirmed(true);
    setShowOptions(false);

    if (type === 'sms') {
      navigate(`/service/list/sms`, { state: { deceasedName } });
    } else if (type === 'call') {
      navigate(`/service/list/call`, { state: { deceasedName } });
    } else if (type === 'voice_chat') {
      navigate(`/service/list/voice-chat`, { state: { deceasedName } });
    }
  };

  const renderDeceasedList = (list) => {
    if (!list || list.length === 0) {
      return '표시할 리스트가 없습니다.';
    }

    return (
      <div className={styles.CardContainer}>
        {list.map((service, idx) => {
          const deceasedCode = service.deceasedCode;
          const deceasedName = service.name || service.deceasedName;
          const profileImageUrl = service.profileImageUrl;
          const services = service.services || [];
          const deceasedBirth = service.deceasedBirth;
          const deceasedDeath = service.deceasedDeath;
          const subscriptionCode = service.subscriptionCode;

          const isFullySubscribed =
            services.includes(1) && services.includes(2);

          return (
            <div key={idx}>
              <div
                className={`${styles.ServiceCard} ${
                  isFullySubscribed ? styles.disabled : ''
                }`}
                onClick={() => {
                  if (!isFullySubscribed) {
                    if (serviceType === 'sms') {
                      navigate('/sms/chat', {
                        state: { subscriptionCode, deceasedName },
                      });
                    } else if (serviceType === 'call') {
                      navigate('/call', {
                        state: { subscriptionCode, deceasedName },
                      });
                    } else if (serviceType === 'voice_chat') {
                      navigate('/voice-chat', {
                        state: { subscriptionCode, deceasedName },
                      });
                    }
                  }
                }}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div className={styles.BadgeTopRight}>
                  {[1, 2, 3].map((code) => {
                    const isCallPage = serviceType === 'call';
                    const isSmsPage = serviceType === 'sms';
                    const isVoiceChatPage = serviceType === 'voice_chat';
                    const isServiceActive = services.includes(code);

                    // 각 서비스 코드에 대해 음성채팅, 통화, 문자채팅을 올바르게 매핑
                    if (isVoiceChatPage && code === 2) {
                      // 2는 음성채팅
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Available}`}
                        >
                          음성채팅
                        </div>
                      );
                    }

                    if (isCallPage && code === 3) {
                      // 3은 통화
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Available}`}
                        >
                          통화
                        </div>
                      );
                    }

                    if (isSmsPage && code === 1) {
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Available}`}
                        >
                          문자채팅
                        </div>
                      );
                    }

                    if (isServiceActive) {
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Unavailable}`}
                        >
                          {code === 1
                            ? '문자채팅'
                            : code === 2
                            ? '음성채팅'
                            : '통화'}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                <div
                  className={`${styles.WaterFill} ${
                    filling && selectedCode === deceasedCode
                      ? styles.Filling
                      : ''
                  }`}
                />

                <div className={styles.ServiceIcon}>
                  <img
                    src={
                      profileImageUrl ||
                      'https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/default_profile.png'
                    }
                    alt="프로필"
                    className={styles.ProfileImage}
                  />
                </div>

                <div className={styles.ServiceInfo}>
                  <div className={styles.ServiceTextArea}>
                    <div className={styles.ServiceName}>故 {deceasedName}</div>
                    {deceasedBirth && deceasedDeath && (
                      <div className={styles.ServiceType}>
                        {deceasedBirth} ~ {deceasedDeath}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.Container}>
      {fullName && (
        <div className={styles.HeaderTextGroup}>
          <h2>{fullName}님의 구독 리스트 입니다.</h2>
          <p className={styles.Description}>
            * 서비스를 이용할 고인의 프로필을 길게 눌러주세요.
          </p>
        </div>
      )}

      {/* 옵션 버튼 */}
      {showOptions && !isModalConfirmed && (
        <div className={styles.OptionButtonContainer}>
          <button
            className={styles.OptionButton}
            onClick={() => handleOptionSelect('voice_chat')}
          >
            음성 채팅
          </button>
          <button
            className={styles.OptionButton}
            onClick={() => handleOptionSelect('call')}
          >
            통화
          </button>
        </div>
      )}

      {/* 스켈레톤 UI 또는 실제 리스트 */}
      {showSkeleton || !isModalConfirmed ? (
        <SkeletonList count={5} />
      ) : (
        renderDeceasedList(deceasedList)
      )}
    </div>
  );
}
