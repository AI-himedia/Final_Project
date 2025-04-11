package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.io.Resource;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {

    private Resource resource;
    private String contentType;
    private String filename;

}