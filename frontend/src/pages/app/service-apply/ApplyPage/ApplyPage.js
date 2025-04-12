import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Pagination } from 'swiper/modules';
import 'swiper/css/pagination';
import './ApplyPage.mobile.css';

export default function ApplyPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const handleSelect = (service) => {
    setSelectedService(service);
    navigate('/service/terms', { state: { service } });
  };

  const slideContents = [
    {
      title: (
        <>
          원하는 서비스를 선택해 주세요
          <br />
          문자 또는 전화 중 하나를 고를 수 있어요.
        </>
      ),
      description: '서비스 이용을 위해 간단한 정보 입력이 필요합니다.',
    },
    {
      title: (
        <>
          문자로 마음을 전해요
          <br />
          짧은 한마디가 큰 위로가 돼요.
        </>
      ),
      description: '하루 한 번, 고인에게 메시지를 보낼 수 있어요.',
    },
    {
      title: (
        <>
          음성으로 감정을 나눠요
          <br />
          목소리로 기억을 이어가요.
        </>
      ),
      description: '전화는 실시간으로 연결되며, 시간 제한이 있어요.',
    },
  ];

  return (
    <div className="ApplyPage_Container">
      <div className="ApplyPage_Title">
        <h2>{slideContents[currentSlide].title}</h2>
        <p className="ApplyPage_Description">
          {slideContents[currentSlide].description}
        </p>
      </div>

      <div className="ApplyPage_Banner">
        <Swiper
          className="ApplyPage_Swiper"
          modules={[Pagination]}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          pagination={{ clickable: true }}
          spaceBetween={50}
          slidesPerView={1}
        >
          <SwiperSlide>
            <img
              src="/assets/apply1.jpg"
              alt="설명1"
              className="ApplyPage_BannerImage"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/assets/apply2.jpg"
              alt="설명2"
              className="ApplyPage_BannerImage"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src="/assets/apply3.jpg"
              alt="설명3"
              className="ApplyPage_BannerImage Image_Zoom"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {currentSlide < 2 ? (
        <div className="ApplyPage_SkipButton">
          <button onClick={() => swiperRef.current?.slideTo(2)}>
            건너뛰기
          </button>
        </div>
      ) : (
        <div className="ApplyPage_CustomNext">
          <Link to="/service/terms">
            <button className="ApplyPage_NextButton">시작하기</button>
          </Link>
        </div>
      )}
    </div>
  );
}
