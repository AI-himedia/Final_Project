package com.aix.againhello;

import io.github.cdimascio.dotenv.Dotenv;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
@MapperScan({
        "com.aix.againhello.oauth.kakao.mapper",
        "com.aix.againhello.sms",
        "com.aix.againhello.call",
        "com.aix.againhello.subscription"
})
public class SpringbootApplication {
    public static void main(String[] args) {
        // .env 파일 로드
        Dotenv dotenv = Dotenv.configure()
                .directory("./") // .env 파일 경로 설정 (기본: 프로젝트 루트)
                .load();

        // 환경변수를 시스템 프로퍼티에 추가
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(SpringbootApplication.class, args);
    }
}