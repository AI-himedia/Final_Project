package com.aix.againhello;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan({
        "com.aix.againhello.oauth.kakao.mapper",
        "com.aix.againhello.sms",
        "com.aix.againhello.call",
        "com.aix.againhello.subscription",
        "com.aix.againhello.S3"
})
public class SpringbootApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootApplication.class, args);
    }
}
