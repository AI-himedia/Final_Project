package com.aix.againhello.admin;

import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AdminService {

    public String callFastApi(String endpoint, Map<String, Object> body) {

        String PYTHON_URL = ServerUrlConstants.PYTHON_URL;
        RestTemplate restTemplate = new RestTemplate();

        String url = PYTHON_URL + endpoint;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                url,
                request,
                String.class
        );
        return response.getBody();
    }

}
