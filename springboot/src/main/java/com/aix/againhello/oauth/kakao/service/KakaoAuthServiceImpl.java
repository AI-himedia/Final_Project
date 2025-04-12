// oauth.kakao.KakaoAuthServicelmpl
package com.aix.againhello.oauth.kakao.service;

import com.aix.againhello.oauth.kakao.jwt.JwtUtil;
import com.aix.againhello.oauth.kakao.dto.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class KakaoAuthServiceImpl implements KakaoAuthService {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Value("${app.props.social.kakao.client-id}")
    private String clientId;

    @Value("${app.props.social.kakao.client-secret}")
    private String clientSecret;

    @Value("${app.props.social.kakao.redirect-uri}")
    private String redirectUri;

    private static final Logger log = LoggerFactory.getLogger(KakaoAuthServiceImpl.class);

    public KakaoAuthServiceImpl(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    public User getKakaoUser(String code) {
        String kakaoTokenUrl = "https://kauth.kakao.com/oauth/token";
        String kakaoUserUrl = "https://kapi.kakao.com/v2/user/me";

        log.info("✅ 카카오 로그인 시작. 받은 인가 코드: {}", code);

        // 1. 토큰 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        params.add("client_secret", clientSecret);

        log.info("Kakao Token Request Headers: {}", headers); // 요청 헤더 로깅
        log.info("Kakao Token Request Parameters: {}", params); // 요청 파라미터 로깅

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(kakaoTokenUrl, tokenRequest, Map.class);

        log.info("Kakao Token Response Headers: {}", tokenResponse.getHeaders()); // 응답 헤더 로깅
        log.info("Kakao Token Response Body: {}", tokenResponse.getBody()); // 응답 본문 로깅

        if (!tokenResponse.getStatusCode().is2xxSuccessful()) {
            log.error("카카오 토큰 요청 실패. 응답 코드: {}, 응답 본문: {}", tokenResponse.getStatusCode(), tokenResponse.getBody());
            throw new RuntimeException("카카오 토큰 요청 실패");
        }

        String accessToken = (String) tokenResponse.getBody().get("access_token");
        log.info("✅ 카카오 access token: {}", accessToken);

        // 2. 사용자 정보 요청
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
        ResponseEntity<Map> userResponse = restTemplate.exchange(kakaoUserUrl, HttpMethod.GET, userRequest, Map.class);

        log.info("Kakao User Response: {}", userResponse); // 사용자 정보 응답 로깅

        if (!userResponse.getStatusCode().is2xxSuccessful()) {
            log.error("카카오 사용자 정보 요청 실패. 응답 코드: {}, 응답 본문: {}", userResponse.getStatusCode(), userResponse.getBody());
            throw new RuntimeException("카카오 사용자 정보 요청 실패");
        }

        Map<String, Object> kakaoAccount = (Map<String, Object>) userResponse.getBody().get("kakao_account");
        String email = (String) kakaoAccount.get("email");

        log.info("✅ 카카오 유저 이메일: {}", email);

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

        // 배포/로컬 자동 분기
        String domain = redirectUri.contains("localhost") ? "localhost" : "againhello.site";
        boolean isSecure = !domain.equals("localhost");

        Cookie accessCookie = new Cookie("access", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(60 * 30);
        accessCookie.setSecure(isSecure);
        accessCookie.setDomain(domain);
        accessCookie.setComment("access");

        Cookie refreshCookie = new Cookie("refresh", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60 * 60 * 24 * 7);
        refreshCookie.setSecure(isSecure);
        refreshCookie.setDomain(domain);
        refreshCookie.setComment("refresh");

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        log.info("✅ access 쿠키 추가됨: {}", accessCookie.getValue());
        log.info("✅ refresh 쿠키 추가됨: {}", refreshCookie.getValue());

        System.out.println("✅ 쿠키 저장 완료");
        System.out.println("access cookie: " + accessCookie.getValue());
        System.out.println("refresh cookie: " + refreshCookie.getValue());

        userService.updateRefreshToken(user.getEmail(), refreshToken);
        System.out.println("✅ DB에 refresh token 업데이트 완료");
    }
}
