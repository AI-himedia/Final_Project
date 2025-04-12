package com.aix.againhello.call.service;

import com.aix.againhello.call.dto.AudioProcessResponseDTO;
import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;

@Service
public class FastApiAudioService {

    public AudioProcessResponseDTO sendAudioFileToPython(File audioFile, int subscriptionCode) {
        // FastAPI 엔드포인트
        String pythonApiUrl = ServerUrlConstants.PYTHON_URL + "process-audio";

        RestTemplate restTemplate = new RestTemplate();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5초
        factory.setReadTimeout(30000);    // 30초
        restTemplate.setRequestFactory(factory);

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 멀티파트 폼 데이터 생성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(audioFile));
        body.add("subscription_code", subscriptionCode);

        // HTTP 요청 엔티티 생성
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // API 호출
        ResponseEntity<AudioProcessResponseDTO> response = restTemplate.exchange(
                pythonApiUrl,
                HttpMethod.POST,
                requestEntity,
                AudioProcessResponseDTO.class
        );

        return response.getBody();
    }
}