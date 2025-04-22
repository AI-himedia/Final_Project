package com.aix.againhello.call.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.upload.allowed-audio-extensions}")
    private String allowedAudioExtensions;

    @Value("${file.upload.allowed-video-extensions}")
    private String allowedVideoExtensions;

    @Value("${file.upload.max-audio-size}")
    private long maxAudioSize;

    @Value("${file.upload.max-video-size}")
    private long maxVideoSize;

    @Value("${file.upload.max-count}")
    private int maxFileCount;

    public void validateFiles(List<MultipartFile> files) {
        if (files == null) {
            return;
        }

        // 파일 개수 확인
        if (files.size() > maxFileCount) {
            throw new RuntimeException("최대 " + maxFileCount + "개의 파일만 업로드할 수 있습니다.");
        }

        List<String> audioExtList = Arrays.asList(allowedAudioExtensions.split(","));
        List<String> videoExtList = Arrays.asList(allowedVideoExtensions.split(","));

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
            boolean isAudioFile = audioExtList.contains(extension);
            boolean isVideoFile = videoExtList.contains(extension);

            if (!isAudioFile && !isVideoFile) {
                throw new RuntimeException("지원하지 않는 파일 형식입니다: " + extension);
            }

            // 파일 크기 확인
            if (isAudioFile && file.getSize() > maxAudioSize) {
                throw new RuntimeException("음성 파일은 최대 5MB까지 업로드할 수 있습니다.");
            }

            if (isVideoFile && file.getSize() > maxVideoSize) {
                throw new RuntimeException("영상 파일은 최대 300MB까지 업로드할 수 있습니다.");
            }
        }
    }

    public String storeFile(MultipartFile file, String type, int subscriptionCode, int deceasedCode) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new RuntimeException("파일명이 없습니다.");
            }

            // 파일 확장자 추출
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

            // 구독코드별 하위 폴더 생성
            Path userUploadPath = Paths.get(uploadDir, String.valueOf(subscriptionCode));
            if (!Files.exists(userUploadPath)) {
                Files.createDirectories(userUploadPath);
            }

            // 고인코드를 포함한 파일명 생성
            String newFilename = deceasedCode + "_" + originalFilename;
            Path targetLocation = userUploadPath.resolve(newFilename);

            // 파일 저장 (기존 같은 파일이 있으면 덮어쓰기)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toString();
        } catch (IOException ex) {
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다: " + ex.getMessage());
        }
    }


}