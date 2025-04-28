import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Pagination } from 'swiper/modules';
import 'swiper/css/pagination';
import './ApplyPage.mobile.css';
import HeaderApply from '../../../components/Header/variants/HeaderApply';

export default function ApplyPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);

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
    <>
      {/* Header를 ApplyPage 내부에서 렌더 */}
      <HeaderApply
        selectedService={selectedService}
        currentSlide={currentSlide}
        swiperRef={swiperRef}
      />

      <div className="ApplyPage_Container">
        {/* 제목, 설명 */}
        <div className="ApplyPage_Title">
          <h2>{slideContents[currentSlide].title}</h2>
          <p className="ApplyPage_Description">
            {slideContents[currentSlide].description}
          </p>
        </div>

        {/* 슬라이드 배너 */}
        <div className="ApplyPage_Banner">
          <Swiper
            className="ApplyPage_Swiper"
            modules={[Pagination]}
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            pagination={{ clickable: true }}
            spaceBetween={50}
            slidesPerView={1}
            simulateTouch={true}
            allowTouchMove={true}
            grabCursor={true}
          >
            <SwiperSlide>
              <img
                src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/apply1.jpg"
                alt="설명1"
                className="ApplyPage_BannerImage"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/apply2.jpg"
                alt="설명2"
                className="ApplyPage_BannerImage"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/apply3.jpg"
                alt="설명3"
                className="ApplyPage_BannerImage Image_Zoom"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </>
  );
}
