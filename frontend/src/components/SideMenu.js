// src/components/SideMenu.js

// css
import '../css/components/SideMenu.css';

// React
import { useState } from 'react';

// 라이브러리
import { Link } from 'react-router-dom';

// MUI Icon
import WindowIcon from '@mui/icons-material/Window';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ParkIcon from '@mui/icons-material/Park';

export default function SideMenu() {
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <>
            <nav className={`SideMenu_Container ${isOpen ? 'open' : 'closed'}`}>
                {/* 상단 메뉴바 */}
                <div className="SideMenu_Frequency">
                    <ul>
                        <li>
                            <Link to="/">
                                <WindowIcon
                                    sx={{
                                        fontSize: 24,
                                        color: '#666',
                                        filter: 'invert(41%) sepia(1%) saturate(0%) hue-rotate(192deg) brightness(90%) contrast(80%)',
                                        display: 'block',
                                        mx: 'auto',
                                    }}
                                />

                                <span>홈</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/">
                                <ParkIcon
                                    sx={{
                                        fontSize: 24,
                                        color: '#666',
                                        filter: 'invert(41%) sepia(1%) saturate(0%) hue-rotate(192deg) brightness(90%) contrast(80%)',
                                        display: 'block',
                                        mx: 'auto',
                                    }}
                                />

                                <span>2번</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/">
                                <ParkIcon
                                    sx={{
                                        fontSize: 24,
                                        color: '#666',
                                        filter: 'invert(41%) sepia(1%) saturate(0%) hue-rotate(192deg) brightness(90%) contrast(80%)',
                                        display: 'block',
                                        mx: 'auto',
                                    }}
                                />

                                <span>3번</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* 하단 SNS */}
                <div className="SideMenu_Media">
                    <ul>
                        <li>
                            <Link to="https://play.google.com/store/games">
                                <img
                                    src="/assets/playstore.png"
                                    alt="플레이스토어"
                                    className="SideMenu_CustomIcon"
                                />
                            </Link>
                        </li>
                        <li>
                            <Link to="https://www.apple.com/kr/app-store/">
                                <img
                                    src="/assets/appstore.png"
                                    alt="애플 스토어"
                                    className="SideMenu_CustomIcon"
                                />
                            </Link>
                        </li>
                        <li>
                            <Link to="https://www.youtube.com/">
                                <img
                                    src="/assets/youtube.png"
                                    alt="유튜브"
                                    className="SideMenu_CustomIcon"
                                />
                            </Link>
                        </li>
                        <li>
                            <Link to="https://www.instagram.com/?hl=ko">
                                <img
                                    src="/assets/instagram.png"
                                    alt="인스타그램"
                                    className="SideMenu_CustomIcon"
                                />
                            </Link>
                        </li>
                        <li>
                            <Link to="https://www.kakaocorp.com/page/service/service/KakaoTalk">
                                <img
                                    src="/assets/kakao.png"
                                    alt="카카오톡"
                                    className="SideMenu_CustomIcon"
                                />
                            </Link>
                        </li>
                    </ul>
                </div>
                <button
                    type="”button”"
                    className="SideMenu_Button"
                    title="접기 또는 펼치기 버튼"
                    onClick={toggleMenu}
                >
                    <div className="SideMenu_Button_Icon">
                        {isOpen ? (
                            <ArrowBackIosIcon
                                fontSize="small"
                                sx={{ marginLeft: '5px' }}
                            />
                        ) : (
                            <ArrowForwardIosIcon
                                fontSize="small"
                                // sx={{ marginLeft: "5px" }}
                            />
                        )}
                    </div>
                </button>
            </nav>
        </>
    );
}
