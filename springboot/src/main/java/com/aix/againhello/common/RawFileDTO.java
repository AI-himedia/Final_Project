package com.aix.againhello.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RawFileDTO {

    private Integer code;               // 초기 데이터 파일 고유 식별자
    private Integer subscriptionCode;   // 구독을 참조하는 식별자 (FK)
    private String audioFilePaths;    // 오디오 파일 데이터 저장 주소
    private String[] smsFilePaths;      // 대화록 데이터 저장 주소 (배열)

}
