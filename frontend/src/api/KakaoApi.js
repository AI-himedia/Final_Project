// src/api/KakaoApi.js

/**
 * Kakao OAuth2 인증 관련 API 모듈
 *
 * 1. 카카오 로그인 URL 생성 (getKakaoLoginLink)
 *    - 사용자를 카카오 로그인 페이지로 리다이렉트함
 *
 * 2. 로그인 후 받은 code를 서버로 전달 (getAccessToken)
 *    - 백엔드가 해당 code로 카카오 access_token을 요청하고 결과를 반환
 *
 * 3. access_token으로 사용자 정보 요청 (getMemberWithAccessToken)
 *    - 백엔드가 카카오 사용자 정보를 받아서 프론트에 전달
 *
 * ※ client_secret, access_token_url 등은 프론트에서 직접 사용하지 않음
 *    → 모든 인증 요청은 백엔드에서 처리됨 (보안상 안전한 구조)
 */

import axios from "axios";

import { API_SERVER_HOST, FRONT_HOST } from "../config/ApiConfig";

// const rest_api_key = process.env.REACT_APP_KAKAO_REST_API_KEY;
// const client_secret = process.env.REACT_APP_KAKAO_CLIENT_SECRET;

const rest_api_key = process.env.REACT_APP_KAKAO_REST_API_KEY;
const client_secret = process.env.REACT_APP_KAKAO_CLIENT_SECRET;

// 리다이렉트 uri => kakaoRedirectPage로 이동
const redirect_uri = `${FRONT_HOST}/member/kakao`; // http://43.200.239.220:3000/member/kakao

// 인증 code 요청 url
const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

// access token 요청 url
// const access_token_url = `https://kauth.kakao.com/oauth/token`;

// 환경변수에서 값을 제대로 가져오는지 디버깅을 위해 로깅
// console.log("REST API KEY:", rest_api_key);
// console.log("FRONT HOST:", FRONT_HOST);
// console.log("REDIRECT URI:", redirect_uri);

// 카카오 로그인 요청 -> 카카오 로그인 페이지(리다이렉트 페이지)로 이동
export const getKakaoLoginLink = () => {
  const kakaoURL = new URL(auth_code_path);
  kakaoURL.searchParams.append("client_id", rest_api_key);
  kakaoURL.searchParams.append("redirect_uri", redirect_uri);
  kakaoURL.searchParams.append("response_type", "code");

  // console.log("getKakaoLoginLink kakaoURL: ", kakaoURL.toString());
  return kakaoURL.toString();
};

// 카카오 로그인 후 code를 받고, 서버가 대신 kakao oauth2서버에 access_token 요청
export const getAccessToken = async (authCode) => {
  try {
    const res = await axios.get(
      `${API_SERVER_HOST}/api/member/kakao/token?code=${authCode}`
    );
    // console.log("getAccessToken res: ", res);
    return res.data;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

// 카카오 사용자 정보 서버에 요청
export const getMemberWithAccessToken = async (accessToken) => {
  const headers = {
    withCredentials: true,
  };
  try {
    const res = await axios.get(
      `${API_SERVER_HOST}/api/member/kakao?accessToken=${accessToken}`,
      headers
    );
    // console.log("getMemberWithAccessToken res: ", res);
    return res.data;
  } catch (error) {
    console.error("Error fetching member data:", error);
    throw error;
  }
};
