import Cookies from "js-cookie";

const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";
const USER_ID_COOKIE_NAME = "userId";

// 현재 환경이 HTTPS인지 확인 (배포 환경이면 true)
const isProduction = window.location.protocol === "https:";

/** Access Token 관련 함수 */
export const setAccessTokenCookie = (token) => {
  Cookies.set(ACCESS_COOKIE_NAME, token, {
    expires: 1 / 48, // 30분
    secure: isProduction, // 운영 환경(HTTPS)에서만 Secure 적용
    sameSite: "Strict", // CSRF 방지
  });
};

export const getAccessTokenCookie = () => {
  return Cookies.get(ACCESS_COOKIE_NAME);
};

export const removeAccessTokenCookie = () => {
  Cookies.remove(ACCESS_COOKIE_NAME);
};

/** Refresh Token 관련 함수 */
export const setRefreshTokenCookie = (token) => {
  Cookies.set(REFRESH_COOKIE_NAME, token, {
    expires: 30,
    secure: isProduction,
    sameSite: "Strict",
  });
};

export const getRefreshTokenCookie = () => {
  return Cookies.get(REFRESH_COOKIE_NAME);
};

export const removeRefreshTokenCookie = () => {
  Cookies.remove(REFRESH_COOKIE_NAME);
};

export const setUserIdCookie = (userId) => {
  Cookies.set(USER_ID_COOKIE_NAME, userId, {
    expires: 7, // 7일
    secure: isProduction,
    sameSite: "Strict",
  });
};

export const getUserIdCookie = () => {
  return Cookies.get(USER_ID_COOKIE_NAME) || "";
};

export const removeUserIdCookie = () => {
  Cookies.remove(USER_ID_COOKIE_NAME);
};
