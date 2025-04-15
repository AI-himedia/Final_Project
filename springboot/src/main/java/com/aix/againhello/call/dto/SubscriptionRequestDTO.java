package com.aix.againhello.call.dto;

import com.aix.againhello.common.DeceasedDataDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequestDTO {

    private int subscriptionCode;
    private DeceasedDataDTO deceasedData;

}
