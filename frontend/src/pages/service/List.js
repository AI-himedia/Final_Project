import styles from './ServiceCheck.module.css';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import SkeletonList from '../../components/common/SkeletonList';
import { useDelaySkeleton } from '../../hooks/useDelaySkeleton';
import { useServiceCheck } from '../../hooks/useServiceCheck';
import { HeaderCheck } from '../../components/Header/variants';
import { useState, useRef, useEffect } from 'react';

export default function ServiceList() {
  const userCode = useSelector((state) => state.user.user?.userCode);
  const fullName = useSelector((state) => state.user.user?.fullName);
  const showSkeleton = useDelaySkeleton(1000);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const callListData = state?.callList;
  const smsResultData = state?.smsResult;
  const { hasService: initialHasService } = useServiceCheck(userCode);

  const [deceasedList, setDeceasedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const pressTimer = useRef(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (location.pathname.startsWith('/service/list/call') && callListData) {
      setDeceasedList(callListData);
    } else if (
      location.pathname.startsWith('/service/list/sms') &&
      smsResultData?.deceasedList
    ) {
      setDeceasedList(smsResultData.deceasedList);
    } else {
      setDeceasedList(initialHasService || []);
    }
    setLoading(false);
  }, [
    location.pathname,
    callListData,
    smsResultData,
    initialHasService,
    state,
  ]);

  const handlePressStart = (code, services) => {
    setSelectedCode(code);
    setFilling(true);

    pressTimer.current = setTimeout(() => {
      navigate(
        `/service/terms/product?deceasedCode=${code}&services=${services.join(
          ','
        )}`
      );
    }, 1000);
  };

  const handlePressEnd = () => {
    setFilling(false);
    setSelectedCode(null);
    clearTimeout(pressTimer.current);
  };

  const serviceMap = {
    1: '문자',
    2: '전화',
  };

  const allServices = [1, 2];

  const renderDeceasedList = (list) => {
    if (!list || list.length === 0) {
      return '표시할 리스트가 없습니다.';
    }

    return (
      <div className={styles.CardContainer}>
        {list.map((service, idx) => {
          // API 응답 데이터 구조에 따라 접근 방식 수정
          const deceasedCode = service.deceasedCode;
          const deceasedName = service.deceasedName;
          const profileImageUrl = service.profileImageUrl;
          const services = service.services || [];
          const deceasedBirth = service.deceasedBirth;
          const deceasedDeath = service.deceasedDeath;

          const isFullySubscribed =
            services.includes(1) && services.includes(2);

          return (
            <div key={idx}>
              <div
                className={`${styles.ServiceCard} ${
                  isFullySubscribed ? styles.disabled : ''
                }`}
                onMouseDown={
                  !isFullySubscribed
                    ? () => handlePressStart(deceasedCode, services)
                    : undefined
                }
                onMouseUp={!isFullySubscribed ? handlePressEnd : undefined}
                onMouseLeave={!isFullySubscribed ? handlePressEnd : undefined}
                onTouchStart={
                  !isFullySubscribed
                    ? () => handlePressStart(deceasedCode, services)
                    : undefined
                }
                onTouchEnd={!isFullySubscribed ? handlePressEnd : undefined}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {/* 뱃지: 항상 문자/전화 둘 다 표시 */}
                <div className={styles.BadgeTopRight}>
                  {allServices.map((code) => {
                    const isAvailable = !services.includes(code);
                    return (
                      <div
                        key={code}
                        className={`${styles.ServiceBadge} ${
                          isAvailable ? styles.Available : styles.Unavailable
                        }`}
                      >
                        {serviceMap[code]}
                      </div>
                    );
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
    <>
      <div className={styles.Container}>
        {fullName && (
          <div className={styles.HeaderTextGroup}>
            <h2>{fullName}님의 구독 리스트 입니다.</h2>
            <p className={styles.Description}>
              * 서비스를 이용할 고인의 프로필을 길게 눌러주세요.
            </p>
          </div>
        )}

        {loading ? (
          <SkeletonList count={3} />
        ) : (
          renderDeceasedList(deceasedList)
        )}

        {location.pathname === '/service' && (
          <div className={styles.ServiceTypeButton}>
            <button
              className={styles.AddButton}
              onClick={() =>
                navigate('/service/terms/product?deceasedCode=null')
              }
            >
              + 고인 프로필 추가하기
            </button>
          </div>
        )}
      </div>
    </>
  );
}
