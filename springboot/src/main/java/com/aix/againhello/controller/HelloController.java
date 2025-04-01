// againhello/controller/HelloController.java

package com.aix.againhello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/be")
public class HelloController {

    // GET /be/test 요청 처리
    @GetMapping("/test")
    public String hello() {
        return "hello";
    }
}