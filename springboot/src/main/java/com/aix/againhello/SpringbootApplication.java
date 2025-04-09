package com.aix.againhello;

import io.github.cdimascio.dotenv.Dotenv;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
@MapperScan({
        "com.aix.againhello.oauth.kakao.mapper",
        "com.aix.againhello.sms",
        "com.aix.againhello.call"
})
public class SpringbootApplication {

    public static void main(String[] args) {
        // Load .env file
        Dotenv dotenv = Dotenv.load();

        // Set as system properties so Spring Boot can use them
        System.setProperty("POSTGRESQL_USERNAME", dotenv.get("POSTGRESQL_USERNAME"));
        System.setProperty("POSTGRESQL_PASSWORD", dotenv.get("POSTGRESQL_PASSWORD"));
        SpringApplication.run(SpringbootApplication.class, args);
    }

}
