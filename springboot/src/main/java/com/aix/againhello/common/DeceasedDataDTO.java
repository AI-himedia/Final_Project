package com.aix.againhello.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeceasedDataDTO {

    private Integer deceasedCode;       // 고인 데이터 고유 식별자
    private String deceasedName;        // 고인 이름
    private String gender;              // 고인 성별 (M, F만 허용)
    private Integer deceasedAge;        // 고인 나이
    private String personality;         // 고인 특성
    private String deceasedNickname;    // 사용자가 고인을 부르는 호칭
    private String userNickname;        // 고인이 사용자를 부르는 호칭
    private String relationship;        // 고인과의 관계
    private Boolean speakingTone;       // 반말 여부 (true: 반말, false:  존댓말)
    private String toneStyle;           // LLM 추출 말투
    private String commonPhrases;       // LLM 추출 자주 쓰는 표현
    private String exampleLines;        // LLM 추출 예시 문장

}