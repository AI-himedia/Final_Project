package com.yourproject.service;

import com.yourproject.dto.TestResponseDto;
import org.springframework.stereotype.Service;

// 비즈니스 로직 처리
@Service
public class TestService {

    public TestResponseDto getTestMessage() {
        return new TestResponseDto("Hello, 회상 프로젝트", 200);
    }
}
