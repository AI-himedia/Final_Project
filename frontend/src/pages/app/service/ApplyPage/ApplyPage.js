import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    navigate(`/service/${service}`);
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
          문자 서비스 안내
          <br />
          고인을 추억하는 메시지를 전달할 수 있어요.
        </>
      ),
      description: '문자는 예약 발송으로 하루에 한 번 전달돼요.',
    },
    {
      title: (
        <>
          전화 서비스 안내
          <br />
          음성으로 감정을 전하고 들을 수 있어요.
        </>
      ),
      description: '통화 시간은 제한되어 있으며, 실시간으로 연결돼요.',
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
              src="/assets/apply.jpg"
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
              className="ApplyPage_BannerImage"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {currentSlide < 2 ? (
        <div className="ApplyPage_SkipButton">
          <button onClick={() => setCurrentSlide(2)}>건너뛰기</button>
        </div>
      ) : (
        <div className="ApplyPage_Buttons">
          <button
            className={`ApplyPage_Button ${
              selectedService === 'sms' ? 'selected' : ''
            }`}
            onClick={() => handleSelect('sms')}
          >
            문자 서비스
          </button>
          <button
            className={`ApplyPage_Button ${
              selectedService === 'call' ? 'selected' : ''
            }`}
            onClick={() => handleSelect('call')}
          >
            전화 서비스
          </button>
        </div>
      )}
    </div>
  );
}
