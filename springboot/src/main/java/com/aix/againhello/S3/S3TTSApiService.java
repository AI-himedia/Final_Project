package com.aix.againhello.S3;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequiredArgsConstructor
public class S3TTSApiService {

    private final TTSService ttsService;

    @GetMapping("/be/readyFile")
    public ResponseEntity<String> ReadyTTS(@RequestParam("subscription_code") int subscriptionCode) {

        String audioPath = ttsService.getAudioPathBySubscriptionCode(subscriptionCode);
        if (audioPath == null||audioPath.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ 오디오 파일을 찾을 수 없습니다.");
        }

        // 1. 값 직접 지정
        TTSRequestDto req = new TTSRequestDto();
        req.setS3_url(audioPath);

        // 2. 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 3. HttpEntity 생성
        HttpEntity<TTSRequestDto> entity = new HttpEntity<>(req, headers);

        // 4. FastAPI 주소
        String url = "http://localhost:8000/be/synthesize";

        // 5. 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return ResponseEntity.ok("✅ FastAPI 응답: " + response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ 요청 실패: " + e.getMessage());
        }
    }
}