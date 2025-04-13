package com.aix.againhello.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentsDTO {

    private Integer code;              // content 식별자
    private Integer deceasedCode;      // 고인 데이터 참조 (FK)
    private Integer subscriptionCode;  // 구독 참조 (FK)
    private String serviceType;        // 'sms' 또는 'call'
    private String role;               // 'user' 또는 'ai'
    private LocalDateTime messageTime; // content 입력 일자
    private String content;            // content 내용
    private List<Float> vectorization; // 벡터화된 content

}
