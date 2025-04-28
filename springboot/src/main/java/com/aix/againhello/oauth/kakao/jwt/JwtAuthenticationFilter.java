// oauth.kakao.JwtAuthenticationFilter
package com.aix.againhello.oauth.kakao.jwt;

import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.service.UserService;
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
import java.util.Objects;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
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
            System.out.println("쿠키개수 : " + request.getCookies().length);
            for (Cookie cookie : request.getCookies()) {
                System.out.println(cookie);
                System.out.println(cookie.getName());
                System.out.println(cookie.getValue());
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
                // access token 재발급이 안되고 있어서 수정한 파트
                try {
                    logger.warn("access token 만료");
                    String emailFromRT = jwtUtil.extractEmail(refreshToken);
                    System.out.println(refreshToken);
                    System.out.println(emailFromRT);
                    User user = userService.findByEmail(emailFromRT);
                    System.out.println(user);

                    if(Objects.equals(user.getRefreshToken(), refreshToken)) {
                        logger.warn("refresh token 비교 통과");
                        String newAccessToken = jwtUtil.createAccessToken(emailFromRT);
//                        jwtUtil.addCookie(response, "access", newAccessToken, 60 * 15, true, null, "access");
                        jwtUtil.setJwtCookies(response, newAccessToken, refreshToken);
                        request.setAttribute("email", emailFromRT);
                        logger.warn("access token 재발급");
                    }

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
