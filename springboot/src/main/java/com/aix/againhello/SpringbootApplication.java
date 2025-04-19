package com.aix.againhello;

import org.mybatis.spring.annotation.MapperScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.http.client.HttpClientAutoConfiguration;

@SpringBootApplication(exclude = {
        HttpClientAutoConfiguration.class
})
@MapperScan({
        "com.aix.againhello.oauth.kakao.mapper",
        "com.aix.againhello.sms",
        "com.aix.againhello.call",
        "com.aix.againhello.subscription",
        "com.aix.againhello.S3"
})
public class SpringbootApplication implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SpringbootApplication.class);
//
//    @Value("${app.props.social.kakao.client-id}")
//    private String clientId;
//
//    @Value("${app.props.social.kakao.client-secret}")
//    private String clientSecret;
//
//    @Value("${app.props.social.kakao.redirect-uri}")
//    private String redirectUri;
//
//    @Value("${app.props.social.kakao.token-uri}")
//    private String tokenUri;
//
//    @Value("${app.props.social.kakao.user-info-uri}")
//    private String userInfoUri;
    @Value("${app.props.social.kakao.redirect-uri}")
    private String RedirectUrl;

    public static void main(String[] args) {
        SpringApplication.run(SpringbootApplication.class, args);
    }

    @Override
    public void run(String... args) {
//        logger.info("env 인식 테스트");
        logger.info("Kakao 리다이렉트 URL: {}", RedirectUrl);
//        logger.info("Kakao Client Secret: {}", clientSecret);
//        logger.info("Kakao Redirect URI: {}", redirectUri);
//        logger.info("Kakao Token URI: {}", tokenUri);
//        logger.info("Kakao User Info URI: {}", userInfoUri);
    }
}
