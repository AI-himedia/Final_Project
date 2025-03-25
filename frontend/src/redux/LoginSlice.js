import { createSlice } from "@reduxjs/toolkit";
import {
  getUserIdCookie,
  getAccessTokenCookie,
  setAccessTokenCookie,
  removeAccessTokenCookie,
  setUserIdCookie,
  removeUserIdCookie,
} from "../utils/Cookie";

// 새로고침 후 쿠키에서 로그인 상태 복원
const initialState = {
  id: getUserIdCookie() || null, // 쿠키에서 사용자 ID 불러오기
  roles: [],
  accessToken: getAccessTokenCookie() || "",
  // refreshToken: getRefreshTokenCookie() || "",
  isAuthenticated: !!getAccessTokenCookie(), // 액세스 토큰이 있으면 로그인 상태 유지
};

const loginSlice = createSlice({
  name: "loginSlice",
  initialState,
  reducers: {
    login: (state, action) => {
      // console.log("login action:", action.payload);
      const { id, roles, accessToken } = action.payload;

      setAccessTokenCookie(accessToken, 30);
      //setRefreshTokenCookie(refreshToken, 7);
      setUserIdCookie(id, 7);

      return {
        id,
        roles,
        accessToken,
        //refreshToken,
        isAuthenticated: true,
      };
    },
    // 로그아웃 시 Redux 상태와 쿠키 삭제
    logout: (state) => {
      removeAccessTokenCookie();
      // removeRefreshTokenCookie();
      removeUserIdCookie();

      return {
        id: null,
        roles: [],
        accessToken: "",
        // refreshToken: "",
        isAuthenticated: false, // 로그아웃 상태 반영
      };
    },
    // 액세스 토큰 갱신 (자동 로그인 유지) + Cookie
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      setAccessTokenCookie(action.payload, 30);
    },
    // 새로고침 시 Redux 상태 초기화 (쿠키에서 불러오기)
    initializeAuth: (state) => {
      const accessToken = getAccessTokenCookie();
      const id = getUserIdCookie();
      // console.log("LoginSlice.js: accessToken =", accessToken, ", userId =", id);
      if (accessToken) {
        state.id = id;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
      }
    },
  },
});

export const { login, logout, setAccessToken, initializeAuth } =
  loginSlice.actions;
export default loginSlice.reducer;
