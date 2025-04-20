package com.aix.againhello.sms;

import com.aix.againhello.common.exception.ServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

@Service
public class FileValidationService {

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.upload.allowed-image-extensions}")
    private String allowedImageExtensions;

    @Value("${file.upload.allowed-text-extensions}")
    private String allowedTextExtensions;

    @Value("${file.upload.max-audio-size}")
    private long maxAudioSize;

    @Value("${file.upload.max-text-size}")
    private long maxTextSize;

    @Value("${file.upload.max-count-text}")
    private int maxFileCount;

    public void validateFiles(List<MultipartFile> files) {
        if (files == null) {
            throw new ServiceException("업로드할 파일이 없습니다.");
        }

        // 파일 개수 확인
        if (files.size() > maxFileCount) {
            throw new ServiceException("최대 " + maxFileCount + "개의 파일만 업로드할 수 있습니다.");
        }

        List<String> imageExtList = Arrays.asList(allowedImageExtensions.split(","));
        List<String> textExtList = Arrays.asList(allowedTextExtensions.split(","));

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new RuntimeException("파일명이 없습니다.");
            }

            // 확장자 추출
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

            // 파일 형식 확인
            boolean isImageFile = imageExtList.contains(extension);
            boolean isTextFile = textExtList.contains(extension);

            if (!isImageFile && !isTextFile) {
                throw new RuntimeException("지원하지 않는 파일 형식입니다: " + extension);
            }

            // 파일 크기 확인
            if (isImageFile && file.getSize() > maxAudioSize) {
                throw new RuntimeException("음성 파일은 최대 5MB까지 업로드할 수 있습니다.");
            }

            if (isTextFile && file.getSize() > maxTextSize) {
                throw new RuntimeException("텍스트 파일은 최대 300MB까지 업로드할 수 있습니다.");
            }
        }
    }

}
