package com.aix.againhello.sms;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.sms.wrapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/be/sms")
public class SmsController {

    @Autowired
    private SmsService smsService;

    /**문자서비스 신청*/
    @PostMapping("/service/start")
    public ResponseEntity<?> startSubscription(
            @RequestParam("subscriptionCode") int subscriptionCode,
            @RequestPart(value = "deceasedData", required = false) DeceasedDataDTO deceasedDataDTO,
            @RequestPart(value = "chatFile", required = false) List<MultipartFile> chatFile
    ) {

        SmsResponse result = smsService.startService(subscriptionCode, deceasedDataDTO, chatFile);

        return ResponseEntity.ok(result);
    }

    /**문자서비스 실행시*/
    @GetMapping("/init-check")
    public ResponseEntity<SmsInitResponse> initCheck() {

        // 1. 문자서비스 미신청인 경우
        // 2. 서비스 신청은 했지만 아직 고인에 대한 데이터 없는 경우
        // 3. 서비스 신청, 고인 데이터 기록 모두 있는 경우
        
        // 유저 코드
        int userCode = 3;
        return ResponseEntity.ok(smsService.checkInit(userCode));
    }

    /**특정 채팅방 입장시*/
    @GetMapping("/recent-contents/{subscriptionCode}")
    public ResponseEntity<List<RecentContentsDTO>> getRecentContents(
            @PathVariable int subscriptionCode) {

        return ResponseEntity.ok(smsService.getRecentContents(subscriptionCode));
    }

    /**문자 입력시*/
    @PostMapping("/chat")
    public ResponseEntity<SmsResponse> chatWithAi(@RequestBody ChatRequestDTO requestDto) {

        SmsResponse response = smsService.sendUserInputToPython(requestDto);

        return ResponseEntity.ok(response);
    }

}





