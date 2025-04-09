package com.aix.againhello.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDTO {

    private Integer code;           // 서비스 고유 식별자
    private String service_name;    // 서비스 이름 (예: SMS, 전화)

}
