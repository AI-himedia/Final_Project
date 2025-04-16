package com.aix.againhello.config;

import com.aix.againhello.call.webSocketHandler.AudioWebSocketHandler;
import com.aix.againhello.oauth.kakao.jwt.JwtCookieInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new AudioWebSocketHandler(), "be/ws/audio")
                .addInterceptors(new JwtCookieInterceptor())
                .setAllowedOrigins("*");
    }

}
