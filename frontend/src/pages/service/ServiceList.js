// src/components/ServiceList.js
import styles from './ServiceCheck.module.css';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import SkeletonList from '../../components/common/SkeletonList';
import { useDelaySkeleton } from '../../hooks/useDelaySkeleton';
import { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../../api/AxiosInstance';

export default function ServiceList() {
  const userCode = useSelector((state) => state.user.user?.userCode);
  const fullName = useSelector((state) => state.user.user?.fullName);
  const showSkeleton = useDelaySkeleton(1000);
  const navigate = useNavigate();
  const location = useLocation();
  // const { state } = location; // 더 이상 location.state를 직접 사용하지 않습니다.

  const [deceasedList, setDeceasedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [serviceType, setServiceType] = useState(null);

  const pressTimer = useRef(null);

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
        if (serviceType === 'call') {
          apiUrl = `/call/user/${userCode}/deceased-list`;
          console.log('[LOG] [API 요청] URL:', apiUrl);
          console.log(
            '[LOG] [API 요청] 헤더:',
            axiosInstance.defaults.headers.common
          ); // 기본 헤더 로깅
          const response = await axiosInstance.get(apiUrl);
          console.log('[LOG] [API 응답] 전화 서비스:', response.data);
          setDeceasedList(response.data);
        } else if (serviceType === 'sms') {
          apiUrl = `/sms/init-check/${userCode}`;
          console.log('[LOG] [API 요청] URL:', apiUrl);
          console.log(
            '[LOG] [API 요청] 헤더:',
            axiosInstance.defaults.headers.common
          ); // 기본 헤더 로깅
          const response = await axiosInstance.get(apiUrl);
          console.log('[LOG] [API 응답] 문자 서비스:', response.data);
          console.log(
            '[LOG] [설정] deceasedList:',
            response.data.subscriptionSummaryDTOList
          );
          setDeceasedList(response.data.subscriptionSummaryDTOList || []);
        } else {
          console.log('[LOG] 알 수 없는 serviceType:', serviceType);
          setDeceasedList([]);
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [userCode, serviceType]);

  useEffect(() => {
    console.log('[LOG] deceasedList 상태 업데이트:', deceasedList); // deceasedList 상태 업데이트 로깅
  }, [deceasedList]);

  const handlePressStart = (services, subscriptionCode) => {
    const isCallService = services.includes(2); // 전화 서비스가 포함되어 있으면
    const isSmsService = services.includes(1); // 문자 서비스가 포함되어 있으면

    // 전화 서비스만 클릭하면 /call로 이동
    if (
      isCallService &&
      !isSmsService &&
      !location.pathname.startsWith('/call') // 경로를 /call로 변경
    ) {
      console.log('[LOG] CALL 클릭');
      navigate(`/call`);
    }

    // 문자 서비스만 클릭하면 /sms/chat으로 이동
    if (
      isSmsService &&
      !isCallService &&
      !location.pathname.startsWith('/sms/chat')
    ) {
      console.log('[LOG] SMS 클릭');
      navigate(`/sms/chat`, { state: { subscriptionCode } });
    }
  };

  const handlePressEnd = () => {
    setFilling(false);
    setSelectedCode(null);
  };

  const renderDeceasedList = (list) => {
    if (!list || list.length === 0) {
      return '표시할 리스트가 없습니다.';
    }

    return (
      <div className={styles.CardContainer}>
        {list.map((service, idx) => {
          const deceasedCode = service.deceasedCode;
          const deceasedName = service.name || service.deceasedName?.name;
          const profileImageUrl = service.profileImageUrl;
          const services = service.services || [];
          const deceasedBirth = service.deceasedBirth;
          const deceasedDeath = service.deceasedDeath;
          const subscriptionCode = service.subscriptionCode;

          console.log('서비스 목록:', serviceType);

          const isFullySubscribed =
            services.includes(1) && services.includes(2);

          return (
            <div key={idx}>
              <div
                key={idx}
                className={`${styles.ServiceCard} ${
                  isFullySubscribed ? styles.disabled : ''
                }`}
                onClick={() => {
                  console.log('클릭됨', subscriptionCode, deceasedName);
                  if (!isFullySubscribed) {
                    if (serviceType === 'sms') {
                      navigate('/sms/chat', {
                        state: { subscriptionCode, deceasedName },
                      });
                    } else if (serviceType === 'call') {
                      navigate('/call');
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

      {loading ? <SkeletonList count={3} /> : renderDeceasedList(deceasedList)}
    </div>
  );
}
