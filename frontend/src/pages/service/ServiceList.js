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

  // URL 경로에 따라 serviceType 설정
  useEffect(() => {
    if (location.pathname.startsWith('/service/list/call')) {
      setServiceType('call');
    } else if (location.pathname.startsWith('/service/list/sms')) {
      setServiceType('sms');
    } else {
      setServiceType(null);
    }
  }, [location.pathname]);

  // serviceType에 맞는 데이터 로드
  useEffect(() => {
    if (!userCode || !serviceType) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        let apiUrl = '';
        if (serviceType === 'call' || serviceType === 'voice_chat') {
          apiUrl = `/call/user/${userCode}/deceased-list`;
          const response = await axiosInstance.get(apiUrl);
          console.log(response);
          setDeceasedList(response.data);
        } else if (serviceType === 'sms') {
          apiUrl = `/sms/init-check/${userCode}`;
          const response = await axiosInstance.get(apiUrl);
          console.log(response);
          setDeceasedList(response.data.subscriptionSummaryDTOList || []);
        } else {
          setDeceasedList([]);
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
  }, [userCode, serviceType]);

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
                      console.log(
                        'Navigating to /call with subscriptionCode:',
                        subscriptionCode
                      );
                      navigate('/call', { state: { subscriptionCode } });
                    }
                  }
                }}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div className={styles.BadgeTopRight}>
                  {[1, 2].map((code) => {
                    const isCallPage = serviceType === 'call';
                    const isSmsPage = serviceType === 'sms';
                    const isServiceActive = services.includes(code);

                    if (isCallPage && code === 2) {
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Available}`}
                        >
                          전화
                        </div>
                      );
                    }

                    if (isSmsPage && code === 1) {
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Available}`}
                        >
                          문자
                        </div>
                      );
                    }

                    if (isServiceActive) {
                      return (
                        <div
                          key={code}
                          className={`${styles.ServiceBadge} ${styles.Unavailable}`}
                        >
                          {code === 1 ? '문자' : '전화'}
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
                    src={profileImageUrl || '/assets/default_profile.png'}
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

      {/* 스켈레톤 UI를 항상 1초 이상 표시 */}
      {showSkeleton ? (
        <SkeletonList count={10} />
      ) : (
        renderDeceasedList(deceasedList)
      )}
    </div>
  );
}
