package com.aix.againhello.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDTO {

    private Integer subscriptionCode;   // 서비스 구독 고유 식별자
    private Integer userCode;           // 구독한 회원의 식별자 (FK)
    private Integer serviceCode;        // 구독한 서비스의 식별자 (FK)
    private Integer deceasedCode;       // 회원이 입력한 고인 데이터의 식별자 (FK)
    private LocalDateTime startDate;    // 구독 시작 날짜
    private LocalDateTime endDate;      // 구독 종료 날짜
    private LocalDateTime cancelDate;   // 구독 취소 신청 날짜

}
