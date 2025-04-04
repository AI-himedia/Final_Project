package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    private final MemberMapper memberMapper;
    private final JwtProvider jwtProvider;

    public String kakaoLogin(String code, HttpServletResponse response) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. access_token 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        params.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);
        ResponseEntity<KakaoTokenResponse> tokenResponse = restTemplate.postForEntity(
                "https://kauth.kakao.com/oauth/token",
                tokenRequest,
                KakaoTokenResponse.class
        );

        String accessToken = tokenResponse.getBody().getAccessToken();

        // 2. 사용자 정보 요청
        HttpHeaders profileHeaders = new HttpHeaders();
        profileHeaders.setBearerAuth(accessToken);
        HttpEntity<?> profileRequest = new HttpEntity<>(profileHeaders);

        ResponseEntity<Map> profileResponse = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                profileRequest,
                Map.class
        );

        Map<String, Object> kakaoAccount = (Map<String, Object>) ((Map<String, Object>) profileResponse.getBody()).get("kakao_account");
        String email = (String) kakaoAccount.get("email");

        // 3. 회원 존재 여부 확인 및 회원 등록
        Member member = memberMapper.findByEmail(email);
        if (member == null) {
            member = new Member();
            member.setEmail(email);
            memberMapper.insert(member);
        }

        // 4. JWT 생성 및 쿠키 저장
        String jwtAccess = jwtProvider.generateAccessToken(member);
        String jwtRefresh = jwtProvider.generateRefreshToken(member);
        jwtProvider.sendTokensToCookie(response, jwtAccess, jwtRefresh);

        return email;

    }
}
