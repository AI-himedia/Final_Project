// oauth.kakao.JwtAuthenticationFilter
package com.aix.againhello.oauth.kakao.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String accessToken = null;
        String refreshToken = null;

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
        } catch (Exception e) {
            try {
                String email = jwtUtil.extractEmail(refreshToken);
                String newAccessToken = jwtUtil.createAccessToken(email);
                Cookie newAccessCookie = new Cookie("access", newAccessToken);
                newAccessCookie.setHttpOnly(true);
                newAccessCookie.setPath("/");
                response.addCookie(newAccessCookie);
            } catch (Exception ignored) {
            }
        }

        filterChain.doFilter(request, response);
    }
}
