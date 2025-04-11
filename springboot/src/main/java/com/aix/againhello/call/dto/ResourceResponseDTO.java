package com.aix.againhello.call.dto;

import org.springframework.core.io.Resource;

public class ResourceResponseDTO {
    private Resource resource;
    private String contentType;
    private String filename;

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }
}