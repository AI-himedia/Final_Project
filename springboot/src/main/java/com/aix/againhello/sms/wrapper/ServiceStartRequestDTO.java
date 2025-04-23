package com.aix.againhello.sms.wrapper;

import com.aix.againhello.common.DeceasedDataDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStartRequestDTO {
    private int subscriptionCode;
    private DeceasedDataDTO deceasedData;
    private List<AnalyzableFileDTO> analyzableFiles;
}
