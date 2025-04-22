package com.aix.againhello.mypage.controller;

import com.aix.againhello.call.dto.PreviewResponseDTO;
import com.aix.againhello.call.service.AudioProcessingService;
import com.aix.againhello.call.service.CallService;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.mypage.dto.MyPageInfoDTO;
import com.aix.againhello.mypage.dto.ServiceUpdateDTO;
import com.aix.againhello.mypage.service.MyPageService;
import com.aix.againhello.sms.SmsService;
import com.aix.againhello.sms.wrapper.DeceasedHintDTO;
import com.aix.againhello.subscription.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/be/mypage")
public class MyPageController {

    @Autowired
    private MyPageService myPageService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private CallService callService;

    @Autowired
    private AudioProcessingService audioProcessingService;

    // 1. 마이페이지 초기 화면
    @GetMapping("/info")
    public ResponseEntity<MyPageInfoDTO> getMyPageInfo(@RequestParam int userCode) {
        return ResponseEntity.ok(myPageService.getMyPageInfo(userCode));
    }

    // 2. 고인 데이터 조회 (수정 페이지 이동)
    @GetMapping("/deceased")
    public ResponseEntity<?> getDeceasedInfo(
            @RequestParam int userCode,
            @RequestParam int deceasedCode
    ) {
        return ResponseEntity.ok(subscriptionService.getDeceasedData(userCode, deceasedCode));
    }

    // 3. 고인 데이터 수정
    @PostMapping(value = "/deceased/update", consumes = "multipart/form-data")
    public ResponseEntity<?> updateDeceased(
            @RequestPart("deceasedDataDto") DeceasedDataDTO deceasedDataDto,
            @RequestPart("serviceSubscriptions") List<ServiceUpdateDTO> serviceSubscriptions,
            @RequestPart(value = "deceasedHint", required = false) List<DeceasedHintDTO> deceasedHintList,
            @RequestPart(value = "smsFiles", required = false) List<MultipartFile> smsFiles,
            @RequestPart(value = "callFiles", required = false) List<MultipartFile> callFiles
    ) {
        Map<String, Object> result = new HashMap<>();

        for (ServiceUpdateDTO sub : serviceSubscriptions) {
            if (sub.getServiceCode() == 1) {
                smsService.startService(sub.getSubscriptionCode(), deceasedDataDto, deceasedHintList, smsFiles);
            } else if (sub.getServiceCode() == 2) {
                // call 서비스 분기
                if (callFiles != null && !callFiles.isEmpty()) {
                    // 오디오 파일이 있으면 기존대로 전체 로직 실행
                    callService.processSubscription(sub.getSubscriptionCode(), deceasedDataDto, callFiles);

                    try {
                        PreviewResponseDTO response = audioProcessingService.separateSpeakers(sub.getSubscriptionCode());
                        result.put("subscriptionCode", sub.getSubscriptionCode());
                        result.put("preview", response);
                    } catch (Exception e) {
                        return ResponseEntity.internalServerError()
                                .body(Map.of("error", "화자 분리 중 오류 발생: " + e.getMessage()));
                    }
                } else {
                    // 오디오 파일이 없으면 고인 데이터만 업데이트
                    Integer deceasedCode = deceasedDataDto.getDeceasedCode();
                    callService.updateDeceasedData(deceasedCode, deceasedDataDto);
                    result.put("subscriptionCode", sub.getSubscriptionCode());
                    result.put("message", "고인 정보만 수정되었습니다.");
                }
            }
        }
        return ResponseEntity.ok(result);
    }

}