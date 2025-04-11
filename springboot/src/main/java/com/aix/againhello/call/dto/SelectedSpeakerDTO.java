package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 선택된 단일 화자 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelectedSpeakerDTO {

    private String originalFilename;    // 원본 파일명
    private String selectedSpeakerId;   // 선택된 화자 ID

}
