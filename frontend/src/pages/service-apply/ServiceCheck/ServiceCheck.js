import styles from './ServiceCheck.module.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SkeletonList from '../../../components/common/SkeletonList';
import { useDelaySkeleton } from '../../../hooks/useDelaySkeleton';
import { useServiceCheck } from '../../../hooks/useServiceCheck';
import { HeaderCheck } from '../../../components/Header/variants';
import { useState, useRef } from 'react';

export default function ServiceCheck() {
  const userCode = useSelector((state) => state.user.user?.userCode);
  const fullName = useSelector((state) => state.user.user?.fullName);
  const showSkeleton = useDelaySkeleton(1000);
  const { hasService } = useServiceCheck(userCode);
  const navigate = useNavigate();

  const pressTimer = useRef(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [filling, setFilling] = useState(false);

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
    2: '음챗',
    3: '통화',
  };

  const allServices = [1, 2, 3];

  return (
    <>
      <HeaderCheck />
      <div className={styles.Container}>
        {fullName && (
          <div className={styles.HeaderTextGroup}>
            <h2>{fullName} 님의 신청 내역</h2>
            <p className={styles.Description}>
              * 서비스를 신청할 고인의 프로필을 길게 눌러주세요.
            </p>
          </div>
        )}

        {showSkeleton || !hasService ? (
          <SkeletonList count={3} />
        ) : hasService.length > 0 ? (
          <div className={styles.CardContainer}>
            {hasService.map((service, idx) => {
              const isFullySubscribed =
                service.services.includes(1) &&
                service.services.includes(2) &&
                service.services.includes(3);

              return (
                <div key={idx}>
                  <div
                    className={`${styles.ServiceCard} ${
                      isFullySubscribed ? styles.disabled : ''
                    }`}
                    onMouseDown={
                      !isFullySubscribed
                        ? () =>
                            handlePressStart(
                              service.deceasedCode,
                              service.services
                            )
                        : undefined
                    }
                    onMouseUp={!isFullySubscribed ? handlePressEnd : undefined}
                    onMouseLeave={
                      !isFullySubscribed ? handlePressEnd : undefined
                    }
                    onTouchStart={
                      !isFullySubscribed
                        ? () =>
                            handlePressStart(
                              service.deceasedCode,
                              service.services
                            )
                        : undefined
                    }
                    onTouchEnd={!isFullySubscribed ? handlePressEnd : undefined}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    {/* 뱃지: 항상 문자/전화 둘 다 표시 */}
                    <div className={styles.BadgeTopRight}>
                      {allServices.map((code) => {
                        const isAvailable = !service.services.includes(code);
                        return (
                          <div
                            key={code}
                            className={`${styles.ServiceBadge} ${
                              isAvailable
                                ? styles.Available
                                : styles.Unavailable
                            }`}
                          >
                            {serviceMap[code]}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className={`${styles.WaterFill} ${
                        filling && selectedCode === service.deceasedCode
                          ? styles.Filling
                          : ''
                      }`}
                    />

                    <div className={styles.ServiceIcon}>
                      <img
                        src={
                          service.profileImageUrl ||
                          'https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/default_profile.png'
                        }
                        alt="프로필"
                        className={styles.ProfileImage}
                      />
                    </div>

                    <div className={styles.ServiceInfo}>
                      <div className={styles.ServiceTextArea}>
                        <div className={styles.ServiceName}>
                          故 {service.deceasedName}
                        </div>
                        <div className={styles.ServiceType}>
                          2002.02.11 ~ 2023.02.11
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          '아직 신청한 서비스가 없습니다.'
        )}

        <div className={styles.ServiceTypeButton}>
          <button
            className={styles.AddButton}
            onClick={() => navigate('/service/terms/product?deceasedCode=null')}
          >
            + 고인 프로필 추가하기
          </button>
        </div>
      </div>
    </>
  );
}
