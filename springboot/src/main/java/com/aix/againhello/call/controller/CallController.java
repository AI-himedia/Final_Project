package com.aix.againhello.call.controller;

import com.aix.againhello.call.dto.*;
import com.aix.againhello.call.service.AudioProcessingService;
import com.aix.againhello.call.service.CallService;
import com.aix.againhello.call.service.PythonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.util.Collections;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/be/call")
@CrossOrigin
public class CallController {

    @Autowired
    private CallService callService;

    @Autowired
    private AudioProcessingService audioProcessingService;

    @Autowired
    private PythonService pythonService;

    @Value("${file.sms.call}")
    private String baseDirectory;

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.output.dir}")
    private String outputDir;


    /**
     * 전화 서비스 신청 및 화자 분리
     */
    @PostMapping("/service/start-and-separate")
    public ResponseEntity<?> startServiceAndSeparateSpeakers(
            @RequestPart("request") SubscriptionRequestDTO request,
            @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles) {

        int subscriptionCode = request.getSubscriptionCode();

        try {
            // 1. 전화 서비스 신청 처리
            callService.processSubscription(subscriptionCode, request.getDeceasedData(), audioFiles);

            // 2. 화자 분리 처리
            PreviewResponseDTO response = audioProcessingService.separateSpeakers(subscriptionCode);

            // 3. 결과 반환
            Map<String, Object> result = new HashMap<>();
            result.put("subscriptionCode", request.getSubscriptionCode());
            result.put("message", "Service processing and speaker separation completed successfully.");
            result.put("preview", response);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "처리 중 오류 발생: " + e.getMessage()));
        }
    }

    /**
     * 오디오 파일 스트리밍(미리 듣기)
     */
    @GetMapping("/audio-direct")
    public ResponseEntity<Resource> streamAudioDirect(@RequestParam String path, @RequestParam int subscriptionCode) {
        try {
            // 경로 디코딩
            String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);
            System.out.println("Decoded path: " + decodedPath);  // 디버깅용

            // decodedPath에서 "/be/call/audio/" 부분 제거
            String cleanPath = decodedPath.replace("/be/call/audio", "");

            // subscriptionCode로 폴더 경로 설정
            String fullPath = outputDir + "/" + subscriptionCode + "/long" + cleanPath;

            // 디버깅: 경로 확인
            System.out.println("Full path to file: " + fullPath);

            File file = new File(fullPath);
            if (!file.exists()) {
                System.out.println("파일이 존재하지 않습니다: " + fullPath);
                return ResponseEntity.notFound().build();  // 파일이 존재하지 않으면 404 반환
            }

            // 파일이 존재하면 스트리밍
            Resource resource = new InputStreamResource(new FileInputStream(file));

            // 파일 확장자 확인
            String fileName = file.getName();
            String fileExtension = getFileExtension(fileName);
            String contentType = getContentType(fileExtension);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + URLEncoder.encode(fileName, StandardCharsets.UTF_8))
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.length()))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();  // 예외 처리
        }
    }

    // 파일 확장자 추출
    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1) {
            return "";
        }
        return filename.substring(dotIndex + 1).toLowerCase();
    }

    // MIME 타입을 파일 확장자에 맞춰 반환
    private String getContentType(String extension) {
        switch (extension) {
            case "wav":
                return "audio/wav";
            case "mp3":
                return "audio/mpeg";
            case "ogg":
                return "audio/ogg";
            case "flac":
                return "audio/flac";
            case "aac":
                return "audio/aac";
            default:
                return "application/octet-stream";  // 알 수 없는 형식은 기본 바이너리 파일로 처리
        }
    }

    @GetMapping("/audio/{filename:.+}")
    public ResponseEntity<Resource> getAudio(
            @PathVariable String filename,
            @RequestParam("subscriptionCode") int subscriptionCode) {
        try {
            ResourceResponseDTO resourceResponse = audioProcessingService.getAudioResource(filename, subscriptionCode);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(resourceResponse.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resourceResponse.getFilename() + "\"")
                    .body(resourceResponse.getResource());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자가 화자 선택 전 뒤로가기 했을 경우
     * */
    @PostMapping("/audio/cleanup")
    public ResponseEntity<?> cleanupAudio(@RequestParam int subscriptionCode) throws IOException {

        Path uploadPath = Paths.get(uploadDir, String.valueOf(subscriptionCode));
        Path outputPath = Paths.get(outputDir, String.valueOf(subscriptionCode));

        audioProcessingService.deleteDirectoryRecursively(uploadPath);
        audioProcessingService.deleteDirectoryRecursively(outputPath);
        
        return ResponseEntity.ok("임시 작업 폴더 삭제 완료");

    }

    /**
     * 선택된 화자 저장
     */
    @PostMapping("/save/selected-speakers")
    public ResponseEntity<?> saveSelectedSpeakers(@RequestBody SelectedSpeakersDTO request) {
        try {
            SaveResponseDTO response = audioProcessingService.saveSelectedSpeakers(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("화자 파일 저장 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 사용자별 보이스챗 서비스 구독 고인 목록 및 최근 통화 시간 조회
     */
    @GetMapping("/user/{userCode}/deceased-list")
    public ResponseEntity<List<CallDeceasedInfoDTO>> getDeceasedListForUser(@PathVariable int userCode) {

        List<CallDeceasedInfoDTO> deceasedList = callService.getCallServiceDeceasedListByUser(userCode);
        return ResponseEntity.ok(deceasedList);
    }

    /**
     * 사용자별 전화 서비스 구독 고인 목록 및 최근 통화 시간 조회
     */
    @GetMapping("/user/{userCode}/deceased-list-for-streaming")
    public ResponseEntity<List<CallDeceasedInfoDTO>> getDeceasedListForCallStreaming(@PathVariable int userCode) {

        List<CallDeceasedInfoDTO> deceasedList = callService.getCallServiceDeceasedListForStreamingByUser(userCode);
        return ResponseEntity.ok(deceasedList);

    }


    /**
     * 오디오 메신저 - client 에서 받은 사용자 발화 python 으로 전달
     * */
    @PostMapping("/audio")
    public ResponseEntity<?> handleAudio(
            @RequestParam("subscriptionCode") String subscriptionCode,
            @RequestParam("audio") MultipartFile audio
    ) {
        try {
            System.out.println("오디오 메신저 에서 받은 subscriptionCode: " + subscriptionCode);
            PythonResponseDTO response = pythonService.sendToPython(subscriptionCode, audio);
            return ResponseEntity.ok().body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

}