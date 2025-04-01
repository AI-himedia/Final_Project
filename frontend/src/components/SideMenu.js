// src/components/SideMenu.js

// css
import { Link } from "react-router";
import "../css/components/SideMenu.css";

export default function SideMenu() {
  return (
    <>
      <div className="SideMenu_Container">
        {/* 상단 메뉴바 */}
        <div className="SideMenu_Frequency">
          <ul>
            <li>
              <Link to="/">
                <i></i>
                <span>사이트맵</span>
              </Link>
            </li>
          </ul>
        </div>
        {/* 하단 SNS */}
        <div className="SideMenu_Media">
          <ul>
            <li>
              <Link to="/">
                <i></i>
              </Link>
            </li>
          </ul>
        </div>
        <button
          type="”button”"
          class="sideButton"
          title="접기 또는 펼치기 버튼"
        >
          <div></div>
        </button>
      </div>
    </>
  );
}
