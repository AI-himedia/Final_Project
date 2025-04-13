package com.aix.againhello.subscription.responseWrapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionInfoResponse {
    public Integer ServiceCode;
    public String deceasedName;
    public Integer deceasedCode;

}
