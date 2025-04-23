package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallDeceasedInfoDTO {

    private int deceasedCode;
    private String deceasedName;
    private String deceasedNickname;
    private int subscriptionCode;
    private LocalDateTime latestCallTime;

}
