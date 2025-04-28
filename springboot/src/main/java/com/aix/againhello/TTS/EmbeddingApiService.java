package com.aix.againhello.TTS;

import com.aix.againhello.util.ServerUrlConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class EmbeddingApiService {

    @PostMapping("/be/embedding") //접속 예시: http://localhost:8080/be/embedding?subscription_code=1
    public ResponseEntity<String> sendSubscriptionCode(@RequestParam("subscription_code") int subscriptionCode, @RequestParam("service_code") int serviceCode) {

        // 1. 요청 데이터 준비
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("subscription_code", subscriptionCode);
        requestBody.put("service_code", serviceCode);

        // 2. 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 3. HttpEntity 생성
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 4. FastAPI 주소
        String url = ServerUrlConstants.PYTHON_URL + "embedding";

        // 5. 요청 보내기
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return ResponseEntity.ok("FastAPI 응답: " + response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("요청 실패: " + e.getMessage());
        }
    }
}
