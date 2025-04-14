package com.aix.againhello.subscription;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.SubscriptionDTO;
<<<<<<< HEAD
=======
import com.aix.againhello.subscription.responseWrapper.ExceptionCaseResponse;
>>>>>>> e45f052bedb84a4524582e0402176ef505980401
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
<<<<<<< HEAD
=======

    boolean existsByDeceasedCode(int deceasedCode);

    ExceptionCaseResponse getSubscriptedWithNoDeceasedData(int userCode);

    boolean existsBySubscriptionCode(int subscriptionCode);
>>>>>>> e45f052bedb84a4524582e0402176ef505980401
}
