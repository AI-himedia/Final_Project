// oauth.kakao.JwtAuthenticationFilter
package com.aix.againhello.oauth.kakao.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String accessToken = null;
        String refreshToken = null;
        String uri = request.getRequestURI();

        if (uri.startsWith("/be/call/audio/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                } else if ("refresh".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        try {
            String email = jwtUtil.extractEmail(accessToken);
            request.setAttribute("email", email);
            if (email == null || email.isEmpty()) {
                try {
                    logger.warn("access token 만료");
                    String emailFromRT = jwtUtil.extractEmail(refreshToken);
                    String newAccessToken = jwtUtil.createAccessToken(emailFromRT);
                    jwtUtil.addCookie(response, "access", newAccessToken, 60 * 15, true, null, "access");
                    request.setAttribute("email", emailFromRT);
                    logger.warn("access token 재발급");
                } catch (Exception ex) {
                    logger.warn("Refresh token invalid: {}", ex.getMessage());
                }
            }
        } catch (Exception e) {
            logger.warn("Access token invalid, trying refresh token");
        }
        filterChain.doFilter(request, response);
    }
}
