// oauth.kakao.KakaoAuthServicelmpl
package com.aix.againhello.oauth.kakao;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class KakaoAuthServiceImpl implements KakaoAuthService {
    private final Dotenv dotenv = Dotenv.load();
    private final JwtUtil jwtUtil;
    private final UserService userService;

    private static final Logger log = LoggerFactory.getLogger(KakaoAuthServiceImpl.class);

    public KakaoAuthServiceImpl(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    public User getKakaoUser(String code) {
        String kakaoTokenUrl = "https://kauth.kakao.com/oauth/token";
        String kakaoUserUrl = "https://kapi.kakao.com/v2/user/me";

        System.out.println("✅ 카카오 로그인 시작");
        System.out.println("받은 인가 코드: " + code);

        // 1. 카카오 토큰 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", dotenv.get("KAKAO_CLIENT_ID"));
        params.add("redirect_uri", dotenv.get("KAKAO_REDIRECT_URI"));
        params.add("code", code);
        params.add("client_secret", dotenv.get("KAKAO_CLIENT_SECRET"));

        System.out.println("테스트 키: " + dotenv.get("KAKAO_CLIENT_ID"));

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(kakaoTokenUrl, tokenRequest, Map.class);

        String accessToken = (String) tokenResponse.getBody().get("access_token");
        System.out.println("✅ 카카오 access token: " + accessToken);

        // 2. 카카오 사용자 정보 요청
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
        ResponseEntity<Map> userResponse = restTemplate.exchange(kakaoUserUrl, HttpMethod.GET, userRequest, Map.class);

        Map<String, Object> kakaoAccount = (Map<String, Object>) userResponse.getBody().get("kakao_account");
        String email = (String) kakaoAccount.get("email");

        System.out.println("✅ 카카오 유저 이메일: " + email);

        return User.builder()
                .email(email)
                .oauth("KAKAO")
                .build();
    }

    @Override
    public void processLogin(User user, HttpServletResponse response) {
        String accessToken = jwtUtil.createAccessToken(user.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());

        System.out.println("JWT access token 생성: " + accessToken);
        System.out.println("JWT refresh token 생성: " + refreshToken);

        Cookie accessCookie = new Cookie("access", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(60 * 30); // 30분
//        accessCookie.setSecure(false);
        accessCookie.setSecure(true);
//        accessCookie.setDomain("localhost");
        accessCookie.setDomain("againhello.site"); // 배포용
        accessCookie.setComment("access");

        Cookie refreshCookie = new Cookie("refresh", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60 * 60 * 24 * 7); // 7일
//        refreshCookie.setSecure(false);
        accessCookie.setSecure(true);
//        refreshCookie.setDomain("localhost"); // 로컬 테스트용
        refreshCookie.setDomain("againhello.site"); // 배포용
        refreshCookie.setComment("refresh");

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        log.info("✅ access 쿠키 추가됨: {}", accessCookie.getValue());
        log.info("✅ refresh 쿠키 추가됨: {}", refreshCookie.getValue());

        for (Cookie cookie : new Cookie[]{accessCookie, refreshCookie}) {
            System.out.println("✅ 쿠키 추가됨: " + cookie.getName() + " = " + cookie.getValue());
        }

        System.out.println("✅ 쿠키 저장 완료");
        System.out.println("access cookie: " + accessCookie.getValue());
        System.out.println("refresh cookie: " + refreshCookie.getValue());

        userService.updateRefreshToken(user.getEmail(), refreshToken);
        System.out.println("✅ DB에 refresh token 업데이트 완료");
    }
}
