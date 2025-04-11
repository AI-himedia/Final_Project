package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AudioProcessResponseDTO {

    private String status;
    private String message;
    private Object processedData;

}