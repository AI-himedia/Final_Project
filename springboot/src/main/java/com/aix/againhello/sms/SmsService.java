package com.aix.againhello.sms;

import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    @Autowired
    private SmsMapper smsMapper;

//    // DB 저장
//    public void saveQuestion(String question) {
//        questionMapper.insertQuestion(question);
//    }

    // Python 서버(FastAPI)로 file을 전달하는 메서드
//    public String getPromptFromLLM(String question) {
//        String apiUrl = "https://againhello.site/ai/initialPrompt";
//        String apiUrl = "http://localhost:8000/ask";
//        RestTemplate restTemplate = new RestTemplate();
//        Map<String, String> request = new HashMap<>();
//        request.put("question", question);
//
//        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
//        return response.getBody();  // FastAPI에서 받은 응답 반환
//    }

    public int getPromptFromLLM(DeceasedDataDTO deceasedData, String filePathOnDB) {
        String pythonApiUrl = ServerUrlConstants.PYTHON_URL + "chat-tone-analysis";
        RestTemplate restTemplate = new RestTemplate();
        Map<String, String> request = new HashMap<>();
        request.put("chatData", filePathOnDB);
        ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, request, String.class);

        System.out.println("python : " + response.getBody());

        // DB 저장 테스트
        deceasedData.setGender('M');
        deceasedData.setAge(30);
        deceasedData.setPersonality("활달하다");
        deceasedData.setDeceasedNickname("아부지");
        deceasedData.setSpeakingTone(true);
        int result = smsMapper.insertDeceasedData(deceasedData);
        System.out.println(result);

        return result;
    }
}
