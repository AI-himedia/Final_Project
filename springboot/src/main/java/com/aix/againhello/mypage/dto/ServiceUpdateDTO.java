package com.aix.againhello.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceUpdateDTO {

    private int serviceCode;
    private int subscriptionCode;

}
