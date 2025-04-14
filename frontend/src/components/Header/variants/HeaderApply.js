import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import styles from '../Header.module.css';

export default function HeaderApply({
  selectedService,
  currentSlide,
  swiperRef,
}) {
  const navigate = useNavigate();
  const isServiceSelected = !!selectedService;
  const isLastSlide = currentSlide === 2;

  const handleClick = () => {
    console.log('클릭됨');
    console.log('isLastSlide:', isLastSlide);

    if (!isLastSlide) {
      console.log('건너뛰기 실행');
      swiperRef.current?.slideTo(2);
    } else {
      console.log('이동 실행');
      navigate('/service/check');
    }
  };

  return (
    <header className={`${styles.Header_Container} ${styles.Header_Default}`}>
      <div className={styles.Header_Inner}>
        <button
          className={`${styles.Header_LoginButton} ${styles.Header_Black}`}
          onClick={() => navigate('/')}
        >
          <IoMdArrowBack fontSize="medium" />
        </button>

        <button
          className={`${
            isLastSlide ? styles.Start : styles.Header_PaymentButton
          } ${isLastSlide && isServiceSelected ? styles.active : ''}`}
          onClick={handleClick}
        >
          {isLastSlide ? '시작하기' : '건너뛰기'}
        </button>
      </div>
    </header>
  );
}
