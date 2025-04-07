package com.aix.againhello.sms;

import com.aix.againhello.sms.apiWrapper.RecentContentsDTO;
import com.aix.againhello.sms.apiWrapper.SubscriptionSummaryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SmsMapper {

    int insertDeceasedData(DeceasedDataDTO deceasedData);

    int hasSmsSubscription(int userCode);

    List<SubscriptionSummaryDTO> findSubscriptionSummaryByUserCode(int userCode);

    List<RecentContentsDTO> findRecentContentsBySubscriptionCode(int subscriptionCode);

}
