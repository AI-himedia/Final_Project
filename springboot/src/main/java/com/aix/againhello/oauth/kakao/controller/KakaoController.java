// src/pages/shared/auth/SignUpPage.js 라는 파일이 아니라 백엔드에서 Kakao 콜백을 처리하는 컨트롤러입니다.
package com.aix.againhello.oauth.kakao.controller;

import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.jwt.JwtUtil;
import com.aix.againhello.oauth.kakao.service.KakaoAuthService;
import com.aix.againhello.oauth.kakao.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/be/member/kakao")
public class KakaoController {

    private static final Logger logger = LoggerFactory.getLogger(KakaoController.class);

    @Value("${server.frontend}")
    private String FrontendRedirectUrl;

    private final KakaoAuthService kakaoAuthService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public KakaoController(KakaoAuthService kakaoAuthService, UserService userService, JwtUtil jwtUtil) {
        this.kakaoAuthService = kakaoAuthService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * OAuth 콜백 엔드포인트:
     * Kakao로부터 인가 코드를 받아, 전체 사용자 데이터를 추출한 후
     * 이메일, 이름, 프로필 이미지 정보만 쿼리 파라미터로 포함하여 회원가입 페이지로 리다이렉트합니다.
     */
    @GetMapping("/callback")
    public void handleKakaoCallback(@RequestParam("code") String code, HttpServletResponse response) {
        try {
            // Kakao로부터 받은 전체 사용자 데이터를 Map으로 받아옴
            Map<String, Object> kakaoData = kakaoAuthService.getKakaoUserData(code);

            // 필요한 데이터 추출: email, fullName, profileImage
            String email = "";
            String fullName = "";
//            String profileImage = "";
            if (kakaoData.get("kakao_account") != null) {
                Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoData.get("kakao_account");
                email = kakaoAccount.get("email") != null ? (String) kakaoAccount.get("email") : "";

                if (kakaoAccount.get("profile") != null) {
                    Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                    fullName = profile.get("nickname") != null ? (String) profile.get("nickname") : "";
//                    profileImage = profile.get("profile_image_url") != null ? (String) profile.get("profile_image_url") : "";
                }
            }

            boolean exists = userService.existsByEmail(email);
            if (exists) {
                logger.info("기존 회원, 로그인 처리 시작: {}", email);

                String finalEmail = email;
                String finalName = fullName;

                User user = User.builder()
                        .email(finalEmail)
                        .oauth("KAKAO")
                        .fullName(finalName)
                        .build();

                String accessToken = jwtUtil.createAccessToken(user.getEmail());
                String refreshToken = jwtUtil.createRefreshToken(user.getEmail());

                jwtUtil.addCookie(response, "access", accessToken, 60 * 60, true, "/", "access");
                jwtUtil.addCookie(response, "refresh", refreshToken, 60 * 60 * 24 * 14, true, null, "refresh");

                userService.updateRefreshToken(user.getEmail(), refreshToken);

                // JSON 응답 제거하고, 리다이렉트만 남김
                response.sendRedirect(FrontendRedirectUrl + "/?login=success");

            } else {
                logger.info("신규 회원, 회원가입 페이지로 이동합니다: {}", email);
                // 필요한 값들만 URL에 넣어 리다이렉트 : email, name, profileImage
                String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
                String encodedName = URLEncoder.encode(fullName, StandardCharsets.UTF_8);
//                String encodedProfileImage = URLEncoder.encode(profileImage, StandardCharsets.UTF_8);

                String redirectUrl = FrontendRedirectUrl + "/signup?"
                        + "email=" + encodedEmail
                        + "&name=" + encodedName;
//                        + "&profileImage=" + encodedProfileImage;

                response.sendRedirect(redirectUrl);
            }
        } catch (Exception e) {
            logger.error("카카오 로그인 처리 중 오류 발생", e);
            try {
                response.sendRedirect( FrontendRedirectUrl + "/login-error");
            } catch (IOException ioe) {
                logger.error("로그인 에러 페이지로 리다이렉트 중 오류", ioe);
            }
        }
    }

    /**
     * 추가 회원가입 API (POST 방식)
     */
    @PostMapping("/signup")
    public Object completeSignup(@RequestBody User user, HttpServletResponse response) {
        try {
            userService.save(user);
            String accessToken = jwtUtil.createAccessToken(user.getEmail());
            String refreshToken = jwtUtil.createRefreshToken(user.getEmail());

            jwtUtil.addCookie(response, "refresh", refreshToken, 60 * 60 * 24 * 14, true, null, "refresh");
            userService.updateRefreshToken(user.getEmail(), refreshToken);

            return ResponseEntity.ok(Map.of(
                    "accessToken", accessToken,
                    "message", "신규 회원가입 및 로그인 완료"
            ));
        } catch (Exception e) {
            logger.error("회원가입 처리 중 오류 발생: {}", e.getMessage(), e);
            return HttpStatus.INTERNAL_SERVER_ERROR + " 회원가입 처리 중 오류 발생: " + e.getMessage();
        }
    }

    /**
     * 회원 탈퇴 처리
     */
    @PostMapping("/withdraw")
    public Object withdraw(@RequestBody String email) {
        try {
            userService.withdraw(email);
            logger.info("회원 탈퇴 처리 완료: {}", email);
            return "회원 탈퇴 처리 완료";
        } catch (Exception e) {
            logger.error("회원 탈퇴 처리 중 오류 발생: {}", e.getMessage(), e);
            return HttpStatus.INTERNAL_SERVER_ERROR + " 회원 탈퇴 처리 중 오류 발생: " + e.getMessage();
        }
    }
}
