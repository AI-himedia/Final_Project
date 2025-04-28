package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class S3RequestDTO {

    String fileUrl;
    int subscriptionCode;
    int serviceCode;
}
