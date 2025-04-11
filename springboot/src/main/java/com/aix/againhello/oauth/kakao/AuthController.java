// oauth.kakao.AuthController
package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
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
        System.out.println("🔥 받은 refreshToken = " + refreshToken);
        if (refreshToken == null || !jwtUtil.isValidToken(refreshToken)) {
            return ResponseEntity.status(401).body("유효하지 않은 refresh token");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userService.findByEmail(email);

        if (user == null || !refreshToken.equals(user.getRefreshToken())) {
            return ResponseEntity.status(403).body("권한 없음");
        }

        String newAccessToken = jwtUtil.createAccessToken(email);
        Cookie accessCookie = new Cookie("access", newAccessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        response.addCookie(accessCookie);

        return ResponseEntity.ok("access token 재발급 완료");
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
        return ResponseEntity.ok(user);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = getTokenFromCookie(request, "access");
        if (accessToken == null || !jwtUtil.isValidToken(accessToken)) {
            return ResponseEntity.status(401).body("유효하지 않은 access token");
        }

        String email = jwtUtil.extractEmail(accessToken);
        userService.updateRefreshToken(email, null); // DB의 refresh 토큰 제거

        deleteCookie(response, "access");
        deleteCookie(response, "refresh");

        return ResponseEntity.ok("로그아웃 완료");
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

    private void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
