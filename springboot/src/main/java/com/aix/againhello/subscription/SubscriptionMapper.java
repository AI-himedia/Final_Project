package com.aix.againhello.subscription;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.DeceasedDetailDTO;
import com.aix.againhello.common.SubscriptionDTO;
import com.aix.againhello.subscription.responseWrapper.ExceptionCaseResponse;
import com.aix.againhello.subscription.responseWrapper.SubscriptionInfoResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SubscriptionMapper {

    List<SubscriptionInfoResponse> getSubscriptionList(int userCode);

    int countServiceTypesByDeceasedCode(Integer deceasedCode);

    boolean existsByUserAndDeceasedAndService(int userCode, Integer deceasedCode, int serviceCode);

    Integer insertSubscription(SubscriptionDTO subscriptionDTO);

    DeceasedDataDTO getDeceasedData(int deceasedCode);

    boolean existsByDeceasedCode(int deceasedCode);

    ExceptionCaseResponse getSubscriptedWithNoDeceasedData(int userCode);

    boolean existsBySubscriptionCode(int subscriptionCode);

    SubscriptionDTO findSubscriptionByCode(int subscriptionCode);

    void updateSubscriptionDeceasedCode(SubscriptionDTO subscription);

    List<SubscriptionDTO> findServiceSubscriptionsByUserAndDeceased(int userCode, int deceasedCode);

    List<SubscriptionDTO> findByUserCode(int userCode);

    DeceasedDetailDTO getDeceasedDetailWithSubscriptions(int userCode, int deceasedCode);
}
