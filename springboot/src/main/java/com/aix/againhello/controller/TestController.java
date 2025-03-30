package com.yourproject.controller;

import com.yourproject.dto.TestResponseDto;
import com.yourproject.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// REST API 컨트롤러
@RestController
@RequestMapping("/api")
public class TestController {

    private final TestService testService;

    // 의존성 주입
    @Autowired
    public TestController(TestService testService) {
        this.testService = testService;
    }

    // GET /api/test 요청 처리sd
    @GetMapping("/test")
    public TestResponseDto getTest() {
        return testService.getTestMessage();
    }
}