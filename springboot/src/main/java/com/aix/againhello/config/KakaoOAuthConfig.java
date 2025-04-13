package com.aix.againhello.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KakaoOAuthConfig {

    @Value("${app.props.social.kakao.client-id}")
    private String clientId;

    @Value("${app.props.social.kakao.client-secret}")
    private String clientSecret;

    @Value("${app.props.social.kakao.redirect-uri}")
    private String redirectUri;

    @Value("${app.props.social.kakao.token-uri}")
    private String tokenUri;

    @Value("${app.props.social.kakao.user-info-uri}")
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
