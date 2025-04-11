package com.aix.againhello.call.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;

/**
 * 파일을 MultipartFile로 변환하기 위한 커스텀 구현
 */
public class CustomMultipartFile implements MultipartFile {
    private final byte[] content;
    private final String name;
    private final String originalFilename;
    private final String contentType;

    public CustomMultipartFile(byte[] content, String originalFilename) {
        this.content = content;
        this.name = "file";
        this.originalFilename = originalFilename;
        this.contentType = "audio/wav";
    }

    public CustomMultipartFile(MultipartFile file, String newFilename) throws IOException {
        this.content = file.getBytes();
        this.name = file.getName();
        this.originalFilename = newFilename;
        this.contentType = file.getContentType() != null ? file.getContentType() : "audio/wav";
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return content == null || content.length == 0;
    }

    @Override
    public long getSize() {
        return content.length;
    }

    @Override
    public byte[] getBytes() throws IOException {
        return content;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}