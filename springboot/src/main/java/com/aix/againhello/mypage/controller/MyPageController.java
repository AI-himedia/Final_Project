package com.aix.againhello.mypage.controller;

import com.aix.againhello.call.service.CallService;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.mypage.dto.MyPageInfoDTO;
import com.aix.againhello.mypage.dto.ServiceUpdateDTO;
import com.aix.againhello.mypage.service.MyPageService;
import com.aix.againhello.sms.SmsService;
import com.aix.againhello.subscription.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
            @RequestPart(value = "smsFiles", required = false) List<MultipartFile> smsFiles,
            @RequestPart(value = "callFiles", required = false) List<MultipartFile> callFiles
    ) {
        for (ServiceUpdateDTO sub : serviceSubscriptions) {
            if (sub.getServiceCode() == 1) {
                smsService.startService(sub.getSubscriptionCode(), deceasedDataDto, smsFiles);
            } else if (sub.getServiceCode() == 2) {
                callService.processSubscription(sub.getSubscriptionCode(), deceasedDataDto, callFiles);
            }
        }
        return ResponseEntity.ok().build();
    }

}
