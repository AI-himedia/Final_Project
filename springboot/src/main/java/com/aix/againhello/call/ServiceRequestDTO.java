package com.aix.againhello.call;

import com.aix.againhello.common.DeceasedDataDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestDTO {

    private int serviceCode;
    private boolean existingSmsUser;
    private boolean usingSameDeceased;
    private DeceasedDataDTO deceasedData;

}