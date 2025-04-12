// againhello/controller/HelloController.java

package com.aix.againhello.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/be")
public class HelloController {

    @Value("${spring.profiles.active:default}")
    private String profile;

    @Value("${spring.datasource.url:NOT_SET}")
    private String datasourceUrl;

    @Value("${custom.env.example:undefined}")
    private String customEnv;

    // GET /be/test 요청 처리
    @GetMapping("/test")
    public String hello() {
        System.out.println("테스트 요청 수신");
        System.out.println("[LOG] Profile: " + profile);
        System.out.println("[LOG] Datasource URL: " + datasourceUrl);
        System.out.println("[LOG] Custom ENV: " + customEnv);
        return "hello";
    }
}
