package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreviewResponseDTO {

    private String status;
    private String message;
    private String outputDir;
    private List<String> fileNames;
    private Map<String, List<SpeakerFileDTO>> speakersByFile;

}
