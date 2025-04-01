// src/components/Header.js

// css
import "../css/components/Header.css";

// React
import { useEffect, useState } from "react";

export default function Header() {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <nav className="Header_Container">
        <div className="Header_Inner">
          <div className="Header_Logo">다시, 안녕</div>
          <ul className="Header_Menu">
            <li>기억의 연대기</li>
            <li>마음의 정원</li>
            <li>우리의 안녕</li>
            <li>기억 앨범</li>
            <li>고인의 이야기</li>
          </ul>
          <div className="Header_Actions">
            <button className="Header_LoginButton">로그인</button>
          </div>
        </div>
      </nav>
    </>
  );
}
