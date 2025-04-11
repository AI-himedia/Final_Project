package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveResponseDTO {

    private String status;
    private String message;
    private String uploadedFile;

}