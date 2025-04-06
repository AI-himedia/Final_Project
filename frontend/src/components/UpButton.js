// src/components/UpButton.js

// css
import '../css/web/components/UpButton.css';

// React
import { useEffect, useState } from 'react';

export default function UpButton() {
  // 스크롤 위치가 기준을 넘었는지 여부
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const threshold = scrollableHeight * 0.2;

      setShowButton(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ul className={`Up_Show ${showButton ? 'visible' : 'hidden'}`}>
      <li>
        <button className="Up_Button" onClick={scrollToTop}>
          <span
            className="icon"
            style={{ backgroundImage: 'url("/assets/top_arrow.png")' }}
          />
        </button>
      </li>
    </ul>
  );
}
