// // src/api/NaverApi.js

// import axios from "axios";

// import { API_SERVER_HOST, FRONT_HOST } from "../config/ApiConfig";

// const client_id = process.env.REACT_APP_NAVER_CLIENT_ID;
// const client_secret = process.env.REACT_APP_NAVER_CLIENT_SECRET;

// // 리다이렉트 uri => naverRedirectPage로 이동
// const redirect_uri = `${FRONT_HOST}/member/naver`; // http://43.200.239.220:3000/member/kakao

// // 인증 code 요청 url
// const auth_code_path = `https://nid.naver.com/oauth2.0/authorize`;

// // access token 요청 url
// const access_token_url = `https://nid.naver.com/oauth2.0/token`;

// // 환경변수에서 값을 제대로 가져오는지 디버깅을 위해 로깅
// // console.log("CLIENT ID:", client_id);
// // console.log("FRONT HOST:", FRONT_HOST);
// // console.log("REDIRECT URI:", redirect_uri);

// // 네이버 로그인 요청 -> 네이버 로그인 페이지(리다이렉트 페이지)로 이동
// export const getNaverLoginLink = () => {
//   const naverURL = new URL(auth_code_path);
//   naverURL.searchParams.append("response_type", "code");
//   naverURL.searchParams.append("client_id", client_id);
//   naverURL.searchParams.append("redirect_uri", redirect_uri);

//   // console.log("getNaverLoginLink naverURL: ", naverURL.toString());
//   return naverURL.toString();
// };

// // 카카오 로그인 후 code를 받고, 서버가 대신 naver oauth2서버에 access_token 요청
// export const getAccessToken = async (authCode) => {
//   try {
//     const res = await axios.get(
//       `${API_SERVER_HOST}/api/member/naver/token?code=${authCode}`
//     );
//     // console.log("getAccessToken res: ", res);
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching access token:", error);
//     throw error;
//   }
// };

// // 네이버 사용자 정보 서버에 요청
// export const getMemberWithAccessToken = async (accessToken) => {
//   const headers = {
//     withCredentials: true,
//   };
//   try {
//     const res = await axios.get(
//       `${API_SERVER_HOST}/api/member/naver?accessToken=${accessToken}`,
//       headers
//     );
//     // console.log("getMemberWithAccessToken res: ", res);
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching member data:", error);
//     throw error;
//   }
// };
