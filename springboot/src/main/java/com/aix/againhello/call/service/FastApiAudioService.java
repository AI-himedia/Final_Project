package com.aix.againhello.call.service;

import com.aix.againhello.call.dto.AudioProcessResponseDTO;
import com.aix.againhello.call.dto.ResponsePythonDTO;
import com.aix.againhello.call.dto.S3RequestDTO;
import com.aix.againhello.util.ServerUrlConstants;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class FastApiAudioService {

    private final ObjectMapper objectMapper = new ObjectMapper();

//    public AudioProcessResponseDTO sendAudioFileToPython(File audioFile, int subscriptionCode) throws IOException {
//        // FastAPI 엔드포인트 - 기존 방식으로 URL 생성
//        String pythonApiUrl = ServerUrlConstants.PYTHON_URL + "process-audio";
//
//        // 파일명
//        String filename = "subCode_" + subscriptionCode + "_combined_audio.wav";
//
//        // HttpClient4를 사용
//        CloseableHttpClient httpClient = HttpClients.createDefault();
//        HttpPost httpPost = new HttpPost(pythonApiUrl);
//
//        // MultipartEntityBuilder를 사용하여 파일과 구독 코드 전송
//        HttpEntity entity = MultipartEntityBuilder.create()
//                .addBinaryBody("file", audioFile, ContentType.DEFAULT_BINARY, filename)
//                .addTextBody("subscription_code", String.valueOf(subscriptionCode), ContentType.TEXT_PLAIN)
//                .build();
//
//        httpPost.setEntity(entity);
//
//        try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
//            HttpEntity responseEntity = response.getEntity();
//            if (responseEntity != null) {
//                String jsonResponse = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
//                return objectMapper.readValue(jsonResponse, AudioProcessResponseDTO.class);
//            } else {
//                throw new IOException("No response from FastAPI server");
//            }
//        } finally {
//            httpClient.close();
//        }
//    }

    public AudioProcessResponseDTO sendS3UrlAndSubCodeToPython(String fileUrl, int subscriptionCode, int serviceCode) throws IOException {
        // FastAPI 엔드포인트 URL
        String pythonApiUrl = ServerUrlConstants.PYTHON_URL + "synthesize";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        S3RequestDTO s3RequestDTO = new S3RequestDTO(
                fileUrl,
                subscriptionCode,
                serviceCode
        );

        HttpEntity<S3RequestDTO> request = new HttpEntity<>(s3RequestDTO, headers);

        ResponseEntity<AudioProcessResponseDTO> response = restTemplate.postForEntity(
                pythonApiUrl,
                request,
                AudioProcessResponseDTO.class);

        return response.getBody();

        // 요청 JSON 생성
//        ObjectMapper objectMapper = new ObjectMapper();
//        String jsonBody = objectMapper.writeValueAsString(
//                Map.of(
//                        "s3_url", fileUrl,
//                        "subscription_code", subscriptionCode,
//                        "service_code", serviceCode
//                )
//        );



//        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
//            HttpPost httpPost = new HttpPost(pythonApiUrl);
//
//            // JSON 본문 설정
//            StringEntity requestEntity = new StringEntity(jsonBody, ContentType.APPLICATION_JSON);
//            httpPost.setEntity(requestEntity);
//
//            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
//                HttpEntity responseEntity = response.getEntity();
//                if (responseEntity != null) {
//                    String jsonResponse = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
//                    return objectMapper.readValue(jsonResponse, AudioProcessResponseDTO.class);
//                } else {
//                    throw new IOException("No response from FastAPI server");
//                }
//            }
//        }
    }

}