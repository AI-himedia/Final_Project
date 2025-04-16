package com.aix.againhello.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeceasedDetailDTO extends DeceasedDataDTO{

    private List<SubscriptionDTO> serviceSubscriptions;

}
