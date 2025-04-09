package com.aix.againhello.call;

import com.aix.againhello.common.SubscriptionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/be/call")
public class CallController {

    @Autowired
    private CallService callService;

    @Autowired
    private ClovaSpeechClient clovaSpeechClient;

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.output.dir}")
    private String outputDir;

    // 전화 서비스 신청 및 사용자와 고인 초기 데이터 저장
    @PostMapping("/service/start")
    public ResponseEntity<?> startService(
            @RequestParam("userCode") int userCode,
            @RequestPart("serviceRequest") ServiceRequestDTO serviceRequestDto,
            @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles) {

        SubscriptionDTO subscription = callService.startService(userCode, serviceRequestDto, audioFiles);

        return ResponseEntity.ok(subscription);
    }

    // 화자 분리
    @PostMapping("/separate/speakers")
    public ResponseEntity<?> separateSpeakers() {
        try {
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
                return ResponseEntity.badRequest().body("파일을 찾을 수 없거나 지원되지 않는 형식입니다.");
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
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "모든 파일의 화자 분리가 완료되었습니다.");
            response.put("outputDir", baseOutputDir.resolve("long").toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("화자 분리 처리 중 오류 발생: " + e.getMessage());
        }
    }

    // 화자 선택 요청

    // 화자 선택 및 S3 저장

}
