package com.aix.againhello.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String commonPath = "file:///C:/againhello/";

        // security 때문에 사용한건데... python 에서도 파일을 읽어올수 있어야 하니...
        // 안쓰는 방향으로 일단...
        // security 사용시에는 정적파일 설정 때문에 /images/ 등이 아니면 error
        // 이미지 파일이 아니더라도 부득이하게 /images/ 사용  ( 더 나은 방법 아시는분 update please)
        registry.addResourceHandler("/images/text/**")
                .addResourceLocations(commonPath + "data/text/");

//        registry.addResourceHandler("/images/business/**")
//                .addResourceLocations(commonPath + "business/");

    }
}
