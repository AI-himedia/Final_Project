package com.aix.againhello.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 모든 요청에 대해서
                .allowedOrigins("*")
//                .allowedOrigins("https://beforeitcools.site")
//                .allowedOrigins("https://localhost:3000")
//                .allowedOrigins("https://beforeitcools.netlify.app")    // 허용할 주소
                .allowedMethods("GET", "POST", "PUT", "DELETE")     // 허용할 HTTP 메소드
                .allowedHeaders("*");   // 허용할 헤더
    }
}