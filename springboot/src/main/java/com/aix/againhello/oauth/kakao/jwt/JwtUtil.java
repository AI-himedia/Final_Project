package com.aix.againhello.oauth.kakao.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final Key secretKey;
    private final long ACCESS_EXP = 1000L * 60 * 15; // 15분
    private final long REFRESH_EXP = 1000L * 60 * 60 * 24 * 14; // 2주

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Access Token 생성
    public String createAccessToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXP))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXP))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰 유효성 검증
    public boolean isValidToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    // 토큰에서 이메일 추출
    public String extractEmail(String token) {
        if (token == null || token.isEmpty()) {
            logger.debug("JWT 토큰이 없거나 빈 문자열입니다.");
            return null;
        }

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("토큰에서 이메일 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    // 쿠키에 JWT 저장 (SameSite 옵션 포함)
    public void setJwtCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // 도메인 설정을 별도 프로퍼티로 관리할 수 있음. 여기서는 null 처리.
        addCookie(response, "access", accessToken, 60 * 15, true, null, "access");
        addCookie(response, "refresh", refreshToken, 60 * 60 * 24 * 14, true, null, "refresh");
    }

    // SameSite 옵션을 포함하는 쿠키 추가 헬퍼 메소드
    public void addCookie(HttpServletResponse response, String name, String value, int maxAge, boolean isSecure, String domain, String comment) {
        StringBuilder cookieBuilder = new StringBuilder();
        cookieBuilder.append(name).append("=").append(value).append(";");
        cookieBuilder.append("Path=/;");
        cookieBuilder.append("Max-Age=").append(maxAge).append(";");
        cookieBuilder.append("HttpOnly;");
        if (domain != null && !domain.isEmpty()) {
            cookieBuilder.append(" Domain=").append(domain).append(";");
        }
        if (isSecure) {
            cookieBuilder.append(" Secure;");
            cookieBuilder.append("SameSite=None");
        }
        cookieBuilder.append(" SameSite=Lax;");
        if (comment != null && !comment.isEmpty()) {
            cookieBuilder.append(" Comment=").append(comment).append(";");
        }
        response.addHeader("Set-Cookie", cookieBuilder.toString());
    }

    // JWT 쿠키 삭제
    public void clearJwtCookies(HttpServletResponse response) {
        clearCookie(response, "access");
        clearCookie(response, "refresh");
    }

    public void clearCookie(HttpServletResponse response, String name) {
        StringBuilder cookieBuilder = new StringBuilder();
        cookieBuilder.append(name).append("=;"); // empty value
        cookieBuilder.append("Path=/;");
        cookieBuilder.append("Max-Age=0;");
        cookieBuilder.append("HttpOnly;");
        cookieBuilder.append(" SameSite=Lax;");
        response.addHeader("Set-Cookie", cookieBuilder.toString());
    }
}
