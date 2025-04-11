package com.aix.againhello.call.service;

import com.aix.againhello.S3.S3Service;
import com.aix.againhello.call.dto.*;
import com.aix.againhello.call.mapper.CallMapper;
import com.aix.againhello.call.utils.CustomMultipartFile;
import com.aix.againhello.common.RawFileDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class AudioProcessingService {

    @Autowired
    private ClovaSpeechClient clovaSpeechClient;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private CallMapper callMapper;

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.output.dir}")
    private String outputDir;

    /**
     * 화자 분리 처리
     */
    public PreviewResponseDTO separateSpeakers() throws Exception {
        // 입력 폴더 경로 (업로드 디렉토리)
        File folder = new File(uploadDir);

        // 출력 기본 디렉토리
        Path baseOutputDir = Paths.get(outputDir);
        Files.createDirectories(baseOutputDir);

        // 지원되는 미디어 파일 목록 가져오기
        File[] mediaFiles = folder.listFiles(file ->
                file.isFile() && ClovaSpeechClient.isSupportedMediaFile(file)
        );

        if (mediaFiles == null || mediaFiles.length == 0) {
            throw new IOException("파일을 찾을 수 없거나 지원되지 않는 형식입니다.");
        }

        // ClovaSpeech 요청 객체 생성
        ClovaSpeechClient.NestRequestEntity requestEntity = new ClovaSpeechClient.NestRequestEntity();

        // 화자 분리 활성화
        ClovaSpeechClient.Diarization diarization = new ClovaSpeechClient.Diarization();
        diarization.setEnable(Boolean.TRUE);
        requestEntity.setDiarization(diarization);

        // 모든 미디어 파일 처리
        for (File mediaFile : mediaFiles) {
            System.out.println("처리 중: " + mediaFile.getName());

            // 음성 인식 및 화자 분리 요청
            String result = clovaSpeechClient.upload(mediaFile, requestEntity);

            // 세그먼트 추출
            clovaSpeechClient.extractSpeakerSegmentsIndividually(result, mediaFile, baseOutputDir);

            System.out.println(mediaFile.getName() + " 처리 완료!");
        }

        // 결과 반환
        PreviewResponseDTO response = new PreviewResponseDTO();
        response.setStatus("success");
        response.setMessage("모든 파일의 화자 분리가 완료되었습니다.");

        // long 폴더 내의 파일 목록 가져오기
        Path longOutputDir = baseOutputDir.resolve("long");
        File[] longFiles = longOutputDir.toFile().listFiles();

        // 파일명 매핑
        List<String> displayNames = new ArrayList<>();
        for (File file : longFiles) {
            String originalName = file.getName();
            // 보여질 이름 생성
            String displayName = originalName.replaceAll("\\d{8}_", "")
                    .replaceFirst("_speaker_(\\d+)_(\\w+)_longest.wav", "_화자$1.wav");
            displayNames.add(displayName);
        }

        response.setOutputDir(baseOutputDir.resolve("long").toString());
        response.setFileNames(displayNames);

        return response;
    }

    /**
     * 오디오 파일 리소스 가져오기
     */
    public ResourceResponseDTO getAudioResource(String filename) throws IOException {
        // long 폴더에서 파일 경로 찾기
        Path filePath = Paths.get(outputDir).resolve("long").resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new IOException("파일을 찾을 수 없습니다: " + filename);
        }

        // 미디어 타입 설정
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        ResourceResponseDTO responseDTO = new ResourceResponseDTO();
        responseDTO.setResource(resource);
        responseDTO.setContentType(contentType);
        responseDTO.setFilename(resource.getFilename());

        return responseDTO;
    }

    /**
     * 원본 오디오 파일별 화자 목록 조회
     */
    private Map<String, List<SpeakerFileDTO>> getSpeakersByOriginalFile(Path baseOutputDir) throws IOException {
        // long 폴더 내의 파일 목록 가져오기
        Path longOutputDir = baseOutputDir.resolve("long");
        File[] longFiles = longOutputDir.toFile().listFiles();

        if (longFiles == null || longFiles.length == 0) {
            return Collections.emptyMap();
        }

        // 원본 파일명 기준으로 화자 파일 그룹화
        Map<String, List<SpeakerFileDTO>> speakersByFile = new HashMap<>();

        for (File file : longFiles) {
            String filename = file.getName();

            String[] parts = filename.split("_speaker_");
            if (parts.length != 2) continue;

            String originalFile = parts[0];
            String speakerInfo = parts[1];

            // 화자 정보 추출
            String[] speakerParts = speakerInfo.split("_");
            String speakerId = speakerParts[0];

            // 보여질 이름 생성
            String displayName = "화자 " + speakerId;

            // DTO 생성
            SpeakerFileDTO speakerFile = new SpeakerFileDTO();
            speakerFile.setOriginalFilename(originalFile);
            speakerFile.setSpeakerId(speakerId);
            speakerFile.setDisplayName(displayName);
            speakerFile.setFilename(filename);
            speakerFile.setFilePath("/be/call/audio/" + filename);

            // 맵에 추가
            if (!speakersByFile.containsKey(originalFile)) {
                speakersByFile.put(originalFile, new ArrayList<>());
            }
            speakersByFile.get(originalFile).add(speakerFile);
        }

        return speakersByFile;
    }

    /**
     * 선택된 화자 저장
     */
    public SaveResponseDTO saveSelectedSpeakers(SelectedSpeakersDTO request) throws IOException, InterruptedException, UnsupportedAudioFileException {
        // 구독 코드 확인
        int subscriptionCode = request.getSubscriptionCode();
        if (subscriptionCode <= 0) {
            throw new IllegalArgumentException("유효하지 않은 구독 코드입니다.");
        }

        // 선택된 화자 파일 처리
        List<File> selectedFiles = new ArrayList<>();
        for (SelectedSpeakerDTO selection : request.getSelections()) {
            String originalFilename = selection.getOriginalFilename();
            String selectedSpeakerId = selection.getSelectedSpeakerId();

            // long 폴더에서 선택된 화자 파일 찾기
            Path longOutputDir = Paths.get(outputDir).resolve("long");
            File[] longFiles = longOutputDir.toFile().listFiles(file ->
                    file.getName().startsWith(originalFilename + "_speaker_" + selectedSpeakerId)
            );

            if (longFiles != null && longFiles.length > 0) {
                // 첫 번째 일치하는 파일 추가
                selectedFiles.add(longFiles[0]);
            }
        }

        // 최대 3개 파일만 처리
        if (selectedFiles.size() > 3) {
            throw new IllegalArgumentException("최대 3개의 파일만 선택할 수 있습니다.");
        }

        // 오디오 파일 연결
        File combinedFile = clovaSpeechClient.combineAudioFiles(selectedFiles);

        // combined 폴더 생성 및 파일 저장
        Path combinedOutputDir = Paths.get(outputDir).resolve("combined");
        Files.createDirectories(combinedOutputDir);
        String combinedFilename = "combined_audio.wav";
        Path combinedFilePath = combinedOutputDir.resolve(combinedFilename);
        Files.copy(combinedFile.toPath(), combinedFilePath);

        // S3에 업로드
        String s3Url = uploadFileToS3(combinedFilePath.toFile(), subscriptionCode);

        // S3에 업로드 성공 후 로컬 디렉토리 및 파일 삭제
        deleteDirectoryRecursively(Paths.get(outputDir)); // 출력 디렉토리 삭제
        deleteDirectoryRecursively(Paths.get(uploadDir));  // 입력 디렉토리 삭제
        System.out.println("출력 및 입력 디렉토리와 모든 하위 폴더 및 파일이 삭제되었습니다.");

        // 응답 생성
        SaveResponseDTO response = new SaveResponseDTO();
        response.setStatus("success");
        response.setMessage("선택된 화자 파일이 성공적으로 저장되었습니다.");
        response.setUploadedFile(s3Url);

        return response;
    }

    /**
     * 최종 파일 S3 업로드 및 DB 저장
     */
    private String uploadFileToS3(File file, int subscriptionCode) throws IOException {
        // MultipartFile로 변환 (S3Service가 MultipartFile을 필요로 함)
        MultipartFile multipartFile = convertFileToMultipart(file);

        // 파일명에 구독 코드 추가
        String newFilename = "subCode_" + subscriptionCode + "_combined_audio.wav";

        // S3에 업로드
        String fileUrl = s3Service.uploadFile(new CustomMultipartFile(multipartFile, newFilename));

        // DB에 파일 정보 저장
        RawFileDTO rawFile = new RawFileDTO();
        rawFile.setSubscriptionCode(subscriptionCode);
        rawFile.setAudioFilePaths(fileUrl);

        callMapper.insertRawFile(rawFile);

        return fileUrl;
    }

    /**
     * File -> MultipartFile 변환 헬퍼 메서드
     */
    private MultipartFile convertFileToMultipart(File file) throws IOException {
        // File을 byte[]로 변환
        byte[] content = Files.readAllBytes(file.toPath());

        // MultipartFile 구현
        return new CustomMultipartFile(content, file.getName());
    }

    /**
     * 디렉토리와 그 하위 모든 폴더 및 파일 삭제 메서드
     */
    private void deleteDirectoryRecursively(Path directory) throws IOException {
        if (Files.exists(directory)) {
            Files.walk(directory)
                    .sorted(Comparator.reverseOrder()) // 하위 경로부터 삭제
                    .map(Path::toFile)
                    .forEach(File::delete);
        }
    }
}