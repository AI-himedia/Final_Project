package com.yourproject.dto;

// 응답 메시지를 담는 DTO
public class TestResponseDto {
    private String message;
    private int status;

    // 생성자
    public TestResponseDto(String message, int status) {
        this.message = message;
        this.status = status;
    }

    // Getter
    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }
}
