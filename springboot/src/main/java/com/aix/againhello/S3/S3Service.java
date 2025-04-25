package com.aix.againhello.S3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public String uploadFile(MultipartFile multipartFile) {
        if (multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = multipartFile.getOriginalFilename().toLowerCase();
        if (originalFilename == null ||
                (!originalFilename.endsWith(".mp3") &&
                        !originalFilename.endsWith(".wav") &&
                        !originalFilename.endsWith(".txt") &&
                        !originalFilename.endsWith(".csv") &&
                        !originalFilename.endsWith(".m4a") &&
                        !originalFilename.endsWith(".jpg") &&
                        !originalFilename.endsWith(".jpeg") &&
                        !originalFilename.endsWith(".png"))) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. (지원 형식: mp3, wav, m4a, txt, jpg, png)");
        }

        try {
            // MultipartFile을 임시 파일로 변환
            File file = convertMultiPartToFile(multipartFile);

            // 업로드 경로 설정 (txt 파일은 다른 폴더에 넣을 수도 있음)
            String lowerCaseName = originalFilename.toLowerCase(); // 확장자 대소문자 구분 방지

            String folder = (lowerCaseName.endsWith(".txt") ||
                    lowerCaseName.endsWith(".csv") ||
                    lowerCaseName.endsWith(".jpg") ||
                    lowerCaseName.endsWith(".jpeg") ||
                    lowerCaseName.endsWith(".png"))
                    ? "text/" : "voice/";
            String fileName = folder + UUID.randomUUID() + "_" + originalFilename;

            // S3 업로드 요청 생성
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(multipartFile.getContentType())
                    .build();

            // S3로 업로드
            PutObjectResponse response = s3Client.putObject(putObjectRequest,
                    RequestBody.fromFile(file));

            // 임시 파일 삭제
            file.delete();

            // 성공 여부 확인
            if (response.sdkHttpResponse().isSuccessful()) {
//                return generatePresignedUrl(fileName);
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


    public String generatePresignedUrl(String key) {

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5)) // 유효시간
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }


    public String extractKeyFromUrl(String url) {
        String prefix = "https://" + bucketName + ".s3.amazonaws.com/";
        if (url.startsWith(prefix)) {
            return url.substring(prefix.length());
        } else {
            throw new IllegalArgumentException("URL이 예상 형식이 아닙니다.");
        }
    }

}
