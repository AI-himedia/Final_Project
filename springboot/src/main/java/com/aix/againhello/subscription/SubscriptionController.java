package com.aix.againhello.subscription;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/be/subscription")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * 유저가 결제는 했지만 고인 정보 입력은 안한 경우 체크
     *
     * @param userCode 사용자 코드
     * @return 해당 케이스 구독 정보
     * subscriptionCode 구독 코드
     * serviceCode 서비스 코드 sms: 1/ call: 2
     */
    @GetMapping("/exception")
    public ResponseEntity<?> getSubscriptedWithNoDeceasedData(@RequestParam("userCode") int userCode) {

        return ResponseEntity.ok(subscriptionService.getSubscriptedWithNoDeceasedData(userCode));
    }

    /**
     * 유저의 구독 정보 조회
     *
     * @param userCode 사용자 코드
     * @return 구독 정보 리스트
     * deceasedCode 고인 코드
     * serviceCode 서비스 코드 sms: 1/ call: 2
     * deceasedName 고인 이름
    */
    @GetMapping("/me")
    public ResponseEntity<?> getSubscriptions(@RequestParam("userCode") int userCode) {

        return ResponseEntity.ok(subscriptionService.getSubscriptionList(userCode));
    }


    /**
     * 결제 성공시
     *
     * @param userCode 사용자 코드
     * @param serviceCode 서비스 코드 sms: 1/ call: 2
     * @param deceasedCode 고인 코드 Nullable
     * @return  subscriptionDTO 생성된 구독정보
     */
    @PostMapping("/subscribe")
    public ResponseEntity<?> createSubscription(
            @RequestParam int userCode,
            @RequestParam int serviceCode,
            @RequestParam(required = false) Integer deceasedCode
    ) {
        Integer newSubscriptionCode = subscriptionService.createSubscription(userCode, serviceCode, deceasedCode);

        return ResponseEntity.ok(newSubscriptionCode);
    }

    /**
     * 고인 데이터 조회시
     *
     * @param deceasedCode 고인 코드 Nullable
     * @param userCode 사용자 코드
     * @return  DeceasedDataDTO 고인정보
     */
    @GetMapping("/deceased")
    public ResponseEntity<?> getDeceasedInfo(
            @RequestParam(required = false) Integer deceasedCode,
            @RequestParam int userCode
    ) {
        if (deceasedCode == null) {
            return ResponseEntity.ok(deceasedCode);
        }

        return ResponseEntity.ok(subscriptionService.getDeceasedData(userCode,deceasedCode));
    }
}
