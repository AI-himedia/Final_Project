package com.aix.againhello.S3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public String uploadFile(MultipartFile multipartFile) {
        if (multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = multipartFile.getOriginalFilename();
        if (originalFilename == null ||
                (!originalFilename.endsWith(".mp3") &&
                        !originalFilename.endsWith(".wav") &&
                        !originalFilename.endsWith(".m4a"))) {
            throw new IllegalArgumentException("지원하지 않는 오디오 파일 형식입니다.");
        }

        try {
            // MultipartFile을 임시 파일로 변환
            File file = convertMultiPartToFile(multipartFile);
            String fileName = "voice/" + UUID.randomUUID() + "_" + multipartFile.getOriginalFilename(); // 파일명 중복 방지

            // S3 업로드 요청 생성
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(multipartFile.getContentType())
                    .build();

            // 파일을 S3로 업로드
            PutObjectResponse response = s3Client.putObject(putObjectRequest,
                    RequestBody.fromFile(file));

            // 파일 삭제 (임시 파일이므로 업로드 후 삭제)
            file.delete();

            // 업로드 성공 여부 확인
            if (response.sdkHttpResponse().isSuccessful()) {
                return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
            } else {
                throw new RuntimeException("파일 업로드 실패");
            }

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류 발생", e);
        }
    }

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        File convFile = File.createTempFile("temp", null);
        file.transferTo(convFile);
        return convFile;
    }
}
