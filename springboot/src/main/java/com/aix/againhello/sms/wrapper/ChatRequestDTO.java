package com.aix.againhello.sms.wrapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDTO {
    private Integer subscriptionCode;
    private String userInput;
    private String serviceType;

}
