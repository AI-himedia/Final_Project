package com.aix.againhello.sms;

import com.aix.againhello.S3.S3Service;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.exception.ServiceException;
import com.aix.againhello.sms.wrapper.*;
import com.aix.againhello.subscription.SubscriptionMapper;
import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class SmsService {

    @Autowired
    private SmsMapper smsMapper;

    @Autowired
    private SubscriptionMapper subscriptionMapper;

    @Autowired
    private FileValidationService fileValidationService;

    @Autowired
    private S3Service s3Service;

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
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("chatData", filePathOnDB);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, requestBody, String.class);


        System.out.println("python : " + response.getBody());

        // DB 저장 테스트
        //deceasedData.setGender('M');
        //deceasedData.setAge(30);
        deceasedData.setPersonality("활달하다");
        deceasedData.setDeceasedNickname("아부지");
        deceasedData.setSpeakingTone(true);
        int result = smsMapper.insertDeceasedData(deceasedData);
        System.out.println(result);

        return result;
    }


    public SmsInitResponse checkInit(int userCode) {
        List<SubscriptionSummaryDTO> subscriptionSummaryDTOList = smsMapper.findSubscriptionSummaryByUserCode(userCode);

        // 문자서비스 미신청인 경우
        if (subscriptionSummaryDTOList == null || subscriptionSummaryDTOList.isEmpty()) {
            return new SmsInitResponse("NO_SUBSCRIPTION", "문자 서비스 미신청", null);
        }

        // 서비스 신청은 했지만 아직 고인에 대한 데이터 없는 경우
        for (SubscriptionSummaryDTO dto : subscriptionSummaryDTOList) {
            if (dto.getName() == null || dto.getName().isEmpty()) {
                return new SmsInitResponse("NO_DECEASED_DATA", "고인 정보가 없습니다.", null);
            }
        }

        // 서비스 신청, 고인 데이터 기록 모두 있는 경우
        return new SmsInitResponse("READY", "문자 서비스 사용 준비 완료", subscriptionSummaryDTOList);
    }

    public List<RecentContentsDTO> getRecentContents(int subscriptionCode) {
        List<RecentContentsDTO> rawList = smsMapper.findRecentContentsBySubscriptionCode(subscriptionCode);

        // 시간순 오름차순 정렬 (가장 오래된 → 최신)
        // 쿼리에서 message_time 기준 desc로 가져오기 때문에 아마 기능중복, 하지만 확실히 하기 위해서
        rawList.sort(Comparator.comparing(RecentContentsDTO::getMessageTime));
        return rawList;
    }

    public SmsResponse sendUserInputToPython(ChatRequestDTO requestDto) {
        // FastAPI 엔드포인트
        String pythonApiUrl = ServerUrlConstants.PYTHON_URL + "responses";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ChatRequestDTO> request = new HttpEntity<>(requestDto, headers);

        ResponseEntity<SmsResponse> response = restTemplate.postForEntity(
                pythonApiUrl,
                request,
                SmsResponse.class
        );

        return response.getBody();
    }


    public SmsResponse startService(int subscriptionCode, DeceasedDataDTO deceasedDataDTO, List<MultipartFile> chatFile) {

        // 1. subscriptionCode 존재여부 확인
        if (!subscriptionMapper.existsBySubscriptionCode(subscriptionCode)) {
            throw new ServiceException("구독(결제) 정보가 없습니다.");
        }

        // 2. file 검증
        fileValidationService.validateFiles(chatFile);

        // 3. file S3에 저장
        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : chatFile) {
            String url = s3Service.uploadFile(file);
            uploadedUrls.add(url);
        }

        // Python 요청용 DTO 구성
        ServiceStartRequestDTO requestDto = new ServiceStartRequestDTO(
                subscriptionCode,
                deceasedDataDTO,
                uploadedUrls
        );

        // 4. python 전달
        String pythonApiUrl = ServerUrlConstants.PYTHON_URL + "service/start";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ServiceStartRequestDTO> request = new HttpEntity<>(requestDto, headers);

        ResponseEntity<SmsResponse> response = restTemplate.postForEntity(
                pythonApiUrl,
                request,
                SmsResponse.class
        );

        // 응답이 200~299 범위에 있는지 확인
        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody(); // 정상 처리
        } else {
            throw new ServiceException("Python 서버로부터 실패 응답을 받았습니다. 상태코드: " + response.getStatusCode());
        }

    }
}
