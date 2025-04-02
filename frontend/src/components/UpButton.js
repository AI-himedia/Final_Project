// src/components/UpButton.js

// css
import { useEffect, useState } from "react";
import "../css/components/UpButton.css";

export default function UpButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const threshold = scrollableHeight / 2;

      setShowButton(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ul className={`Up_Show ${showButton ? "visible" : "hidden"}`}>
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
