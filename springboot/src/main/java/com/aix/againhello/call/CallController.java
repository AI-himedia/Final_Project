package com.aix.againhello.call;

import com.aix.againhello.common.SubscriptionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/be/call")
public class CallController {

    @Autowired
    private CallService callService;

    // 전화 서비스 선택 -> 문자 서비스 이용 여부 확인
    // 문자 서비스 이용 + 해당 고인과의 전화 서비스 이용 -> 음성/영상 파일 업로드
    // 문자 서비스 이용 + 새로운 고인과의 전화 서비스 이용 | 문자 서비스 이용 X -> 사용자 및 고인 초기 데이터 입력 및 음성/영상 파일 업로드

    // 전화 서비스 신청
    @PostMapping("/service/start")
    public ResponseEntity<?> startService(
            @RequestParam("userCode") int userCode,
            @RequestPart("serviceRequest") ServiceRequestDTO serviceRequestDto,
            @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles) {

        SubscriptionDTO subscription = callService.startService(userCode, serviceRequestDto, audioFiles);

        return ResponseEntity.ok(subscription);
    }

    // 사용자 초기 데이터 저장

    // 화자 분리

    // 화자 선택 요청

    // 화자 선택 및 S3 저장

}
