package com.aix.againhello.mypage.service;

import com.aix.againhello.common.DeceasedDetailDTO;
import com.aix.againhello.common.SubscriptionDTO;
import com.aix.againhello.common.exception.ServiceException;
import com.aix.againhello.mypage.dto.MyPageInfoDTO;
import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.mapper.UserMapper;
import com.aix.againhello.subscription.SubscriptionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MyPageService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private SubscriptionMapper subscriptionMapper;

    public MyPageInfoDTO getMyPageInfo(int userCode) {

        User user = userMapper.findById(userCode);
        if (user == null) throw new ServiceException("유저 정보가 존재하지 않습니다.");

        // 구독 테이블에서 userCode로 구독 목록 조회 (고인별 중복 없이)
        List<SubscriptionDTO> subscriptions = subscriptionMapper.findByUserCode(userCode);

        // 고인코드별로 그룹핑
        Map<Integer, DeceasedDetailDTO> deceasedMap = new HashMap<>();
        for (SubscriptionDTO sub : subscriptions) {
            int deceasedCode = sub.getDeceasedCode();
            DeceasedDetailDTO deceased = deceasedMap.get(deceasedCode);
            if (deceased == null) {
                // 고인 정보 + 서비스 구독 정보 조립
                deceased = subscriptionMapper.getDeceasedDetailWithSubscriptions(userCode, deceasedCode);
                deceasedMap.put(deceasedCode, deceased);
            }
        }

        // 결과 조립
        MyPageInfoDTO result = new MyPageInfoDTO();
        result.setUser(user);
        result.setDeceasedList(new ArrayList<>(deceasedMap.values()));
        return result;
    }

}