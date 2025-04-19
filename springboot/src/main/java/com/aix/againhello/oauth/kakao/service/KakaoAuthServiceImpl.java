// KakaoAuthServiceImpl.java
package com.aix.againhello.oauth.kakao.service;

import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.jwt.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.nio.charset.StandardCharsets;

@Service
public class KakaoAuthServiceImpl implements KakaoAuthService {

    private static final Logger logger = LoggerFactory.getLogger(KakaoAuthServiceImpl.class);

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Value("${app.props.social.kakao.client-id}")
    private String clientId;

    @Value("${app.props.social.kakao.client-secret}")
    private String clientSecret;

    @Value("${app.props.social.kakao.redirect-uri}")
    private String KakaoRedirectUri;

    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me";

    public KakaoAuthServiceImpl(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    /**
     * Kakao의 사용자 정보 전체 JSON 응답을 Map으로 반환 (디버깅용)
     */
    public Map<String, Object> getKakaoUserData(String code) {
        logger.info("카카오 로그인 시작. 받은 인가 코드: {}", code);

        // 1. 토큰 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", KakaoRedirectUri);
        params.add("code", code);
        params.add("client_secret", clientSecret);

//        logger.info("[KakaoAuthService] 토큰 요청 redirect_uri: {}", redirectUri);

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(KAKAO_TOKEN_URL, tokenRequest, Map.class);

        logger.info("Kakao Token Response Status: {}", tokenResponse.getStatusCode());
        logger.info("Kakao Token Response Body: {}", tokenResponse.getBody());

        if (!tokenResponse.getStatusCode().is2xxSuccessful()) {
            logger.error("카카오 토큰 요청 실패. 응답 코드: {}, 응답 본문: {}", tokenResponse.getStatusCode(), tokenResponse.getBody());
            throw new RuntimeException("카카오 토큰 요청 실패");
        }

        String accessToken = (String) tokenResponse.getBody().get("access_token");
        logger.info("카카오 access token: {}", accessToken);

        // 2. 사용자 정보 요청
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
        ResponseEntity<Map> userResponse = restTemplate.exchange(KAKAO_USER_URL, HttpMethod.GET, userRequest, Map.class);

        logger.info("Kakao User Response Status: {}", userResponse.getStatusCode());
        logger.info("Kakao User Response Body: {}", userResponse.getBody());

        if (!userResponse.getStatusCode().is2xxSuccessful()) {
            logger.error("카카오 사용자 정보 요청 실패. 응답 코드: {}, 응답 본문: {}", userResponse.getStatusCode(), userResponse.getBody());
            throw new RuntimeException("카카오 사용자 정보 요청 실패");
        }
        return userResponse.getBody();
    }

    @Override
    public User getKakaoUser(String code) {
        // 기존 방식: 필요한 정보만 추출하여 User 객체를 반환
        Map<String, Object> kakaoData = getKakaoUserData(code);
        Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoData.get("kakao_account");
        if (kakaoAccount == null || kakaoAccount.get("email") == null) {
            logger.error("카카오 계정 정보에 이메일이 존재하지 않습니다: {}", kakaoAccount);
            throw new RuntimeException("카카오 계정 정보에 이메일이 존재하지 않습니다.");
        }
        String email = (String) kakaoAccount.get("email");
        // 예시로, 이름은 kakao_account.profile.nickname에서 가져옴 (있다면)
        String fullName = "";
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        if (profile != null && profile.get("nickname") != null) {
            fullName = (String) profile.get("nickname");
        }
        logger.info("카카오 유저 이메일: {}", email);
        return User.builder()
                .email(email)
                .oauth("KAKAO")
                .fullName(fullName)
                .build();
    }

    @Override
    public void processLogin(User user, HttpServletResponse response) {
        String accessToken = jwtUtil.createAccessToken(user.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());

        logger.info("JWT access token 생성: {}", accessToken);
        logger.info("JWT refresh token 생성: {}", refreshToken);

        jwtUtil.setJwtCookies(response, accessToken, refreshToken);

        userService.updateRefreshToken(user.getEmail(), refreshToken);
        logger.info("DB에 refresh token 업데이트 완료 for user: {}", user.getEmail());
    }
}
