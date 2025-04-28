package com.aix.againhello.call.service;

import com.aix.againhello.call.dto.PythonResponseDTO;
import com.aix.againhello.call.utils.MultipartInputStreamFileResource;
import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PythonService {

    public PythonResponseDTO sendToPython(String subscriptionCode, MultipartFile audio) throws IOException {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("subscriptionCode", subscriptionCode);
        body.add("audio", new MultipartInputStreamFileResource(audio.getInputStream(), audio.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<PythonResponseDTO> response = restTemplate.postForEntity(
                ServerUrlConstants.PYTHON_URL + "api/process-audio",
                request,
                PythonResponseDTO.class
        );

        String llmText = response.getBody().getText();
        String base64Audio = response.getBody().getAudio();

        return response.getBody();
    }
}
