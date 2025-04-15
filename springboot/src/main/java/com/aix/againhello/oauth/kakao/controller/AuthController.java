package com.aix.againhello.oauth.kakao.controller;

import com.aix.againhello.oauth.kakao.dto.LoginRequest;
import com.aix.againhello.oauth.kakao.jwt.JwtUtil;
import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/be/member")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthController(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }


    // access 토큰 재발급
    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getTokenFromCookie(request, "refresh");
        if (refreshToken == null || !jwtUtil.isValidToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "유효하지 않은 refresh token"));
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userService.findByEmail(email);

        if (user == null || !refreshToken.equals(user.getRefreshToken())) {
            return ResponseEntity.status(403).body(Map.of("error", "권한 없음"));
        }

        String newAccessToken = jwtUtil.createAccessToken(email);

        // Access 토큰 쿠키로 보내기
        jwtUtil.addCookie(response, "access", newAccessToken, 60 * 15, true, null, "access");

        return ResponseEntity.ok(Map.of("message", "access token 재발급 완료"));
    }

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        String accessToken = getTokenFromCookie(request, "access");
        if (accessToken == null || !jwtUtil.isValidToken(accessToken)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "ERROR_ACCESS_TOKEN"));
        }

        String email = jwtUtil.extractEmail(accessToken);
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // 추출
        return ResponseEntity.ok(Map.of(
                "userCode", user.getCode(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "oauth", user.getOauth()
        ));
    }


    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = getTokenFromCookie(request, "access");
        String email = accessToken != null && jwtUtil.isValidToken(accessToken)
                ? jwtUtil.extractEmail(accessToken)
                : null;

        if (email != null) {
            userService.updateRefreshToken(email, null); // DB에서 refreshToken 삭제
        }

        jwtUtil.clearCookie(response, "access");
        jwtUtil.clearCookie(response, "refresh");

        return ResponseEntity.ok(Map.of("message", "로그아웃 완료"));
    }


    private String getTokenFromCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
