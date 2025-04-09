package com.aix.againhello.call;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreviewResponseDTO {

    private String status;
    private String message;
    private String outputDir;
    private List<String> fileNames;

}
