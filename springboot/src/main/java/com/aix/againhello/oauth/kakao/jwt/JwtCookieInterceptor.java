package com.aix.againhello.oauth.kakao.jwt;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtCookieInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception{


        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest req = servletRequest.getServletRequest();

            // 1. 토큰 인증
            String token = getTokenFromCookie(req, "access");
            if (token == null || !jwtUtil.isValidToken(token)) {
                return false;
            }

            String userEmail = jwtUtil.extractEmail(token);
            attributes.put("userEmail", userEmail);
            System.out.println("[인터셉터] 유저 이메일: " + userEmail);

            // 2. subscriptionCode
            String subscriptionCode = req.getParameter("subscriptionCode");
            if (subscriptionCode != null) {
                attributes.put("subscriptionCode", subscriptionCode);
                System.out.println("[인터셉터] 구독 코드 저장됨: " + subscriptionCode);
            } else {
                System.out.println("[인터셉터] 구독 코드 없음");
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
    }

    private String getTokenFromCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())){
                return cookie.getValue();
            }
        }
        return null;
    }

}
