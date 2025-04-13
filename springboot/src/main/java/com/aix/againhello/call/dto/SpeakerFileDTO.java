package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeakerFileDTO {

    private String originalFilename;
    private String speakerId;
    private String displayName;
    private String filename;
    private String filePath;

}
