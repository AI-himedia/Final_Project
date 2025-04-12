// againhello/controller/HelloController.java

package com.aix.againhello.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/be")
public class HelloController {

    @Value("${app.props.social.kakao.client-id}")
    private String clientId;

    @Value("${app.props.social.kakao.client-secret}")
    private String clientSecret;

    @Value("${app.props.social.kakao.redirect-uri}")
    private String redirectUri;

    @GetMapping("/test")
    public Map<String, String> hello() {
        return Map.of(
                "message", "hello",
                "profile", clientId,
                "datasourceUrl", clientSecret,
                "customEnv", redirectUri
        );
    }
}