package com.aix.againhello.call.service;

import com.aix.againhello.S3.S3Service;
import com.aix.againhello.call.dto.*;
import com.aix.againhello.call.mapper.CallMapper;
import com.aix.againhello.call.utils.CustomMultipartFile;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j // Lombok SLF4J 로거 추가
public class AudioProcessingService {

    @Autowired
    private ClovaSpeechClient clovaSpeechClient;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private FastApiAudioService fastApiAudioService; // FastAPI 호출 서비스

    @Autowired
    private CallMapper callMapper;

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.output.dir}")
    private String outputDir;

    /**
     * 화자 분리 처리 (Clova Speech API 사용)
     */
    public PreviewResponseDTO separateSpeakers(int subscriptionCode) throws Exception {
        log.info("화자 분리 처리 시작...");

        // 1. 구독코드별 업로드 폴더 지정
        File folder = new File(uploadDir, String.valueOf(subscriptionCode));
        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("해당 구독코드의 업로드 폴더가 존재하지 않습니다: {}", folder.getAbsolutePath());
            throw new IOException("해당 구독코드의 업로드 폴더가 존재하지 않습니다.");
        }

        // 2. 구독코드별 출력 폴더 지정
        Path baseOutputDir = Paths.get(outputDir, String.valueOf(subscriptionCode));
        Files.createDirectories(baseOutputDir);

        // 3. 미디어 파일 목록 조회
        File[] mediaFiles = folder.listFiles(file ->
                file.isFile() && ClovaSpeechClient.isSupportedMediaFile(file)
        );

        if (mediaFiles == null || mediaFiles.length == 0) {
            log.warn("처리할 미디어 파일을 찾을 수 없거나 지원되지 않는 형식입니다. Upload 디렉토리: {}", folder.getAbsolutePath());
            throw new IOException("파일을 찾을 수 없거나 지원되지 않는 형식입니다.");
        }

        // 4. Clova Speech API 요청 준비
        ClovaSpeechClient.NestRequestEntity requestEntity = new ClovaSpeechClient.NestRequestEntity();
        ClovaSpeechClient.Diarization diarization = new ClovaSpeechClient.Diarization();
        diarization.setEnable(Boolean.TRUE);
        requestEntity.setDiarization(diarization);

        // 5. 파일별 화자 분리 처리
        for (File mediaFile : mediaFiles) {
            log.info("Clova Speech 처리 중: {}", mediaFile.getName());
            try {
                String result = clovaSpeechClient.upload(mediaFile, requestEntity);
                clovaSpeechClient.extractSpeakerSegmentsIndividually(result, mediaFile, baseOutputDir);
                log.info("{} 처리 완료!", mediaFile.getName());
            } catch (Exception e) {
                log.error("{} 처리 중 Clova Speech API 오류 발생", mediaFile.getName(), e);
                // 개별 파일 실패 시 계속 진행
            }
        }

        // 6. 응답 생성
        PreviewResponseDTO response = new PreviewResponseDTO();
        response.setStatus("success");
        response.setMessage("모든 파일의 화자 분리가 완료되었습니다.");

        // 7. 화자별 파일 정보 생성 및 추가
        try {
            response.setSpeakersByFile(getSpeakersByOriginalFile(baseOutputDir));
        } catch (IOException e) {
            log.error("화자별 파일 목록 생성 중 오류 발생", e);
            response.setMessage("화자 분리는 완료되었으나, 파일 목록 생성 중 오류가 발생했습니다.");
            response.setStatus("partial_success");
        }

        response.setOutputDir(baseOutputDir.resolve("long").toString());

        log.info("화자 분리 처리 완료.");
        return response;
    }

    /**
     * 오디오 파일 리소스 가져오기 (다운로드 등)
     */
    public ResourceResponseDTO getAudioResource(String filename, int subscriptionCode) throws IOException {
        Path filePath = Paths.get(outputDir, String.valueOf(subscriptionCode), "long", filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            log.error("오디오 리소스를 찾을 수 없거나 읽을 수 없습니다: {}", filePath);
            throw new IOException("파일을 찾을 수 없습니다: " + filename);
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream"; // 기본 타입
        }

        ResourceResponseDTO responseDTO = new ResourceResponseDTO();
        responseDTO.setResource(resource);
        responseDTO.setContentType(contentType);
        responseDTO.setFilename(resource.getFilename()); // 보안상 파일명 노출 주의

        log.info("오디오 리소스 반환: {}", filename);
        return responseDTO;
    }

    /**
     * 원본 오디오 파일별 화자 목록 조회 (내부 헬퍼)
     */
    private Map<String, List<SpeakerFileDTO>> getSpeakersByOriginalFile(Path baseOutputDir) throws IOException {
        Path longOutputDir = baseOutputDir.resolve("long");
        File[] longFiles = longOutputDir.toFile().listFiles();

        if (longFiles == null) {
            log.warn("long 디렉토리를 읽을 수 없거나 존재하지 않습니다: {}", longOutputDir);
            return Collections.emptyMap();
        }
        if (longFiles.length == 0) {
            log.info("long 디렉토리에 분리된 화자 파일이 없습니다: {}", longOutputDir);
            return Collections.emptyMap();
        }

        Map<String, List<SpeakerFileDTO>> speakersByFile = new HashMap<>();
        for (File file : longFiles) {
            String filename = file.getName();
            // 파일명 구조: {originalFilename}_speaker_{speakerId}_{uuid}_longest.wav (예상)
            String[] parts = filename.split("_speaker_");
            if (parts.length != 2) {
                log.warn("예상치 못한 파일명 형식 발견, 건너<0xEB><0x9B><0x84>: {}", filename);
                continue; // 예상 형식 아니면 건너뜀
            }

            String originalFile = parts[0]; // 원본 파일명 (UUID 등 포함될 수 있음)
            String speakerInfoPart = parts[1];

            String[] speakerParts = speakerInfoPart.split("_");
            if (speakerParts.length < 1) {
                log.warn("화자 ID를 추출할 수 없는 파일명 형식: {}", filename);
                continue;
            }
            String speakerId = speakerParts[0];
            String displayName = "화자 " + speakerId; // 사용자에게 보여줄 이름

            SpeakerFileDTO speakerFile = new SpeakerFileDTO();
            speakerFile.setOriginalFilename(originalFile); // 내부 식별용 원본 파일명
            speakerFile.setSpeakerId(speakerId);
            speakerFile.setDisplayName(displayName);
            speakerFile.setFilename(filename); // 실제 저장된 파일명
            speakerFile.setFilePath("/be/call/audio/" + filename); // API 경로

            speakersByFile.computeIfAbsent(originalFile, k -> new ArrayList<>()).add(speakerFile);
        }
        log.info("원본 파일별 화자 목록 생성 완료. 원본 파일 수: {}", speakersByFile.size());
        return speakersByFile;
    }

    /**
     * 사용자가 선택한 화자들의 오디오를 병합하고 저장/처리
     */
    public SaveResponseDTO saveSelectedSpeakers(SelectedSpeakersDTO request) throws IOException, InterruptedException, UnsupportedAudioFileException {
        int subscriptionCode = request.getSubscriptionCode();
        int serviceCode = request.getServiceCode();
        log.info("선택된 화자 저장 시작. 구독 코드: {}", subscriptionCode);
        if (subscriptionCode <= 0) {
            throw new IllegalArgumentException("유효하지 않은 구독 코드입니다.");
        }

        List<File> combinedSpeakerFiles = new ArrayList<>();
        Set<String> uniqueSelections = new HashSet<>();

        Path baseOutputDir = Paths.get(outputDir, String.valueOf(subscriptionCode));
        Path combinedOutputDir = baseOutputDir.resolve("combined");
        Files.createDirectories(combinedOutputDir);

        File combinedFile = null;
        try {
            for (SelectedSpeakerDTO selection : request.getSelections()) {
                String originalFilename = selection.getOriginalFilename();
                String selectedSpeakerId = selection.getSelectedSpeakerId();

                if (selectedSpeakerId == null || "none".equals(selectedSpeakerId)
                        || originalFilename == null || originalFilename.trim().isEmpty()) {
                    log.info("파일/화자 정보가 없거나 '해당 없음' 선택됨: originalFilename={}, speakerId={}", originalFilename, selectedSpeakerId);
                    continue;
                }

                String selectionKey = originalFilename + "_" + selectedSpeakerId;
                if (!uniqueSelections.add(selectionKey)) {
                    log.warn("중복된 화자 선택 감지: {}", selectionKey);
                    continue;
                }

                // segment 파일들이 저장된 폴더
                Path segmentDir = baseOutputDir.resolve(originalFilename);

                // 해당 화자 segment 파일만 필터링 (예: speaker_1_A_XXX.wav)
                File[] segmentFiles = segmentDir.toFile().listFiles(f -> f.getName().startsWith("speaker_" + selectedSpeakerId + "_") && f.getName().endsWith(".wav"));

                if (segmentFiles == null || segmentFiles.length == 0) {
                    log.warn("선택된 화자 segment 파일이 없습니다: {}", segmentDir);
                    continue;
                }
                Arrays.sort(segmentFiles, Comparator.comparing(File::getName));

                // segment 파일들을 하나로 합침 (임시 파일 생성)
                File combinedSpeakerFile = clovaSpeechClient.combineAudioFiles(Arrays.asList(segmentFiles));
                combinedSpeakerFiles.add(combinedSpeakerFile);
            }

            if (combinedSpeakerFiles.isEmpty()) {
                log.error("병합할 유효한 화자 segment 파일이 선택되지 않았습니다.");
                throw new IllegalArgumentException("병합할 유효한 화자 segment 파일이 없습니다.");
            }
            if (combinedSpeakerFiles.size() > 3) {
                log.warn("선택된 화자 파일 개수 초과: {}", combinedSpeakerFiles.size());
                throw new IllegalArgumentException("최대 3개의 화자 파일만 선택할 수 있습니다.");
            }

            log.info("선택된 화자 segment {}개를 병합합니다.", combinedSpeakerFiles.size());
            combinedFile = clovaSpeechClient.combineAudioFiles(combinedSpeakerFiles);
            log.info("오디오 파일 병합 완료: {}", combinedFile.getName());

            // combined 폴더에 저장
            String combinedFilename = "combined_audio_" + UUID.randomUUID().toString().substring(0, 8) + ".wav";
            Path combinedFilePath = combinedOutputDir.resolve(combinedFilename);
            Files.copy(combinedFile.toPath(), combinedFilePath);

            String s3Url = null;
            try {
                s3Url = uploadFileToS3(combinedFilePath.toFile(), subscriptionCode, serviceCode);
                log.info("S3 업로드 및 FastAPI 호출 완료. S3 URL: {}", s3Url);

                deleteDirectoryRecursively(baseOutputDir);
                deleteDirectoryRecursively(Paths.get(uploadDir, String.valueOf(subscriptionCode)));
                log.info("처리 완료 후 로컬 출력 및 입력 디렉토리가 삭제되었습니다.");

                SaveResponseDTO response = new SaveResponseDTO();
                response.setStatus("success");
                response.setMessage("선택된 화자 파일이 성공적으로 저장 및 처리되었습니다.");
                response.setUploadedFile(s3Url);
                return response;
            } catch (Exception e) {
                log.error("선택된 화자 저장/처리 중 오류 발생. 구독 코드: {}", subscriptionCode, e);
                throw new RuntimeException("선택된 화자 파일 처리 중 오류 발생: " + e.getMessage(), e);
            }
        } finally {
            if (combinedFile != null && combinedFile.exists()) {
                if (combinedFile.delete()) {
                    log.debug("임시 병합 파일 삭제 완료: {}", combinedFile.getName());
                } else {
                    log.warn("임시 병합 파일 삭제 실패: {}", combinedFile.getName());
                }
            }
            for (File f : combinedSpeakerFiles) {
                if (f != null && f.exists()) {
                    if (f.delete()) {
                        log.debug("임시 화자 병합 파일 삭제 완료: {}", f.getName());
                    } else {
                        log.warn("임시 화자 병합 파일 삭제 실패: {}", f.getName());
                    }
                }
            }
        }
    }

    /**
     * 최종 병합 파일을 S3 업로드, DB 저장 및 FastAPI로 파일 직접 전송
     * @throws IOException 파일 처리 오류 시
     * @throws RuntimeException FastAPI 호출 실패 등 내부 처리 오류 시
     */
    private String uploadFileToS3(File file, int subscriptionCode, int serviceCode) throws IOException {
        log.debug("S3 업로드 및 FastAPI 전송 시작. 파일: {}, 구독 코드: {}", file.getName(), subscriptionCode);

        // MultipartFile로 변환
        MultipartFile multipartFile = convertFileToMultipart(file);

        // S3 저장용 파일명
        String finalS3Filename = "subCode_" + subscriptionCode + "_combined_audio.wav";

        // S3에 업로드
        String fileUrl = s3Service.uploadFile(new CustomMultipartFile(multipartFile, finalS3Filename));
        log.info("S3 업로드 완료. 파일 URL: {}", fileUrl);

        // FastAPI로 S3 URL과 subscriptionCode 전송
        try {
            log.debug("FastAPI로 S3 URL 전송 시도...");
            AudioProcessResponseDTO pythonResponse = fastApiAudioService.sendS3UrlAndSubCodeToPython(fileUrl, subscriptionCode, serviceCode);
            log.info("FastAPI 응답 수신: {}", pythonResponse);

            if ("success".equals(pythonResponse.getStatus())) {
                log.info("FastAPI 처리 성공.");
            } else {
                log.warn("FastAPI 처리 실패 응답: status={}, message={}", pythonResponse.getStatus(), pythonResponse.getMessage());
                throw new RuntimeException("Python API 처리 실패: " + pythonResponse.getMessage());
            }
        } catch (Exception e) {
            log.error("FastAPI 호출 중 심각한 오류 발생. 구독 코드: {}", subscriptionCode, e);
            throw new RuntimeException("FastAPI 서비스 호출 실패: " + e.getMessage(), e);
        }

        log.debug("S3 업로드 및 FastAPI 전송 완료.");
        return fileUrl;
    }

    /**
     * File 객체를 MultipartFile 객체로 변환하는 헬퍼 메서드
     */
    private MultipartFile convertFileToMultipart(File file) throws IOException {
        byte[] content = Files.readAllBytes(file.toPath());
        // CustomMultipartFile은 content type 등을 더 정확히 설정할 수 있도록 구현되었을 것으로 가정
        return new CustomMultipartFile(content, file.getName());
    }

    /**
     * 지정된 디렉토리와 그 하위의 모든 폴더 및 파일을 재귀적으로 삭제하는 메서드
     */
    public void deleteDirectoryRecursively(Path directory) throws IOException {
        if (Files.exists(directory)) {
            log.warn("디렉토리 삭제 시도: {}", directory); // 삭제 전 로그
            try {
                Files.walk(directory)
                        .sorted(Comparator.reverseOrder()) // 하위 경로(파일)부터 삭제해야 함
                        .map(Path::toFile)
                        .forEach(f -> {
                            if (!f.delete()) {
                                // 파일 삭제 실패 시 경고 로그 (디버깅에 도움)
                                log.warn("파일 삭제 실패: {}", f.getAbsolutePath());
                            }
                        });
                log.info("디렉토리 삭제 완료: {}", directory);
            } catch (IOException e) {
                log.error("디렉토리 삭제 중 오류 발생: {}", directory, e);
                throw e; // 오류 발생 시 상위로 전파
            }
        } else {
            log.debug("삭제할 디렉토리가 존재하지 않음: {}", directory);
        }
    }
}