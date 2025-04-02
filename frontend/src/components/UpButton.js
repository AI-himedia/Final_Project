// src/components/UpButton.js

// css
import "../css/components/UpButton.css";

export default function UpButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <ul className="Up_Show">
      <li>
        <button className="Up_Button" onClick={scrollToTop}>
          <span className="icon" />
        </button>
      </li>
    </ul>
  );
}
