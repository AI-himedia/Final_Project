// config.KakaoOAuthConfig
package com.aix.againhello.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KakaoOAuthConfig {

    @Value("${oauth2.kakao.client-id}")
    private String clientId;

    @Value("${oauth2.kakao.client-secret}")
    private String clientSecret;

    @Value("${oauth2.kakao.redirect-uri}")
    private String redirectUri;

    @Value("${oauth2.kakao.token-uri}")
    private String tokenUri;

    @Value("${oauth2.kakao.user-info-uri}")
    private String userInfoUri;

    // Getters
    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public String getTokenUri() {
        return tokenUri;
    }

    public String getUserInfoUri() {
        return userInfoUri;
    }
}