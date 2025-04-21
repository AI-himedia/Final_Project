package com.aix.againhello.call.controller;

import com.aix.againhello.call.dto.*;
import com.aix.againhello.call.service.AudioProcessingService;
import com.aix.againhello.call.service.CallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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

    @Value("${file.call}")
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
            String fullPath = baseDirectory + "/" + subscriptionCode + "/long" + cleanPath;

            // 디버깅: 경로 확인
            System.out.println("Full path to file: " + fullPath);

            File file = new File(fullPath);
            if (!file.exists()) {
                System.out.println("파일이 존재하지 않습니다: " + fullPath);
                return ResponseEntity.notFound().build();  // 파일이 존재하지 않으면 404 반환
            }

            // 파일이 존재하면 스트리밍
            Resource resource = new InputStreamResource(new FileInputStream(file));

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.length()))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();  // 예외 처리
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
     * 사용자별 전화 서비스 구독 고인 목록 및 최근 통화 시간 조회
     */
    @GetMapping("/user/{userCode}/deceased-list")
    public ResponseEntity<List<CallDeceasedInfoDTO>> getDeceasedListForUser(@PathVariable int userCode) {

        List<CallDeceasedInfoDTO> deceasedList = callService.getCallServiceDeceasedListByUser(userCode);
        return ResponseEntity.ok(deceasedList);

    }

}