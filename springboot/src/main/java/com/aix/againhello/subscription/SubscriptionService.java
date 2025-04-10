package com.aix.againhello.subscription;

import com.aix.againhello.call.ServiceException;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.SubscriptionDTO;
import com.aix.againhello.oauth.kakao.mapper.UserMapper;
import com.aix.againhello.subscription.responseWrapper.SubscriptionInfoResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubscriptionService {
    private static final int SMS_SERVICE_CODE = 1;
    private static final int CALL_SERVICE_CODE = 2;

    @Autowired
    private SubscriptionMapper subscriptionMapper;

    @Autowired
    private UserMapper userMapper;


    /**
     * 현재 로그인한 사용자의 구독 정보 조회
     *
     * @param userCode 사용자 코드
     * @return deceasedCode 고인 코드
     * serviceCode 서비스 코드 sms: 1/ call: 2
     * deceasedName 고인 이름
     */
    public List<SubscriptionInfoResponse> getSubscriptionList(int userCode) {

        // 1. 사용자 존재 여부 확인
        if (!userMapper.existsById(userCode)) {
            throw new ServiceException("사용자를 찾을 수 없습니다.");
        }

        return subscriptionMapper.getSubscriptionList(userCode);
    }

    /**
     * 결제 성공시
     *
     * @param userCode 사용자 코드
     * @param serviceCode 서비스 코드 sms: 1/ call: 2
     * @param deceasedCode 고인 코드 Nullable
     * @return  고인 코드
     */
    @Transactional
    public Integer createSubscription(int userCode, int serviceCode, Integer deceasedCode) {

        // 1. 사용자 존재 여부 확인
        if (!userMapper.existsById(userCode)) {
            throw new ServiceException("사용자를 찾을 수 없습니다.");
        }

        // 2. 서비스 코드가 1 또는 2인지
        if (serviceCode !=SMS_SERVICE_CODE && serviceCode !=CALL_SERVICE_CODE) {
            throw new ServiceException("유효하지 않은 서비스입니다.");
        }


        if (deceasedCode != null) {
            // 3. 해당 고인과 이미 해당 서비스 이용중인지
            boolean exists = subscriptionMapper.existsByUserAndDeceasedAndService(userCode, deceasedCode, serviceCode);
            if (exists) {
                throw new ServiceException("이미 같은 고인과 같은 서비스 구독중입니다.");
            }

            // 4. 해당 고인코드로 이미 문자, 전화 서비스 모두 이용중인지 확인
            int serviceCount = subscriptionMapper.countServiceTypesByDeceasedCode(deceasedCode);
            if (serviceCount >= 2) {
                throw new ServiceException("이미 모든 서비스 이용중입니다.");
            }
        }

        SubscriptionDTO subscriptionDTO = new SubscriptionDTO();
        subscriptionDTO.setUserCode(userCode);
        subscriptionDTO.setServiceCode(serviceCode);
        if (deceasedCode != null) {
            subscriptionDTO.setDeceasedCode(deceasedCode);
        }

        subscriptionMapper.insertSubscription(subscriptionDTO);

        return subscriptionDTO.getSubscriptionCode();

    }

    public DeceasedDataDTO getDeceasedData(int deceasedCode) {
        return subscriptionMapper.getDeceasedData(deceasedCode);
    }
}
