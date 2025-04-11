package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 화자 파일 정보 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeakerFileDTO {

    private String originalFilename; // 원본 파일명
    private String speakerId;        // 화자 ID
    private String displayName;      // 화면에 표시할 이름
    private String filename;         // 실제 파일명
    private String filePath;         // 파일 재생 경로

}
