package com.aix.againhello.sms;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.sms.wrapper.RecentContentsDTO;
import com.aix.againhello.sms.wrapper.SubscriptionSummaryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SmsMapper {

    int insertDeceasedData(DeceasedDataDTO deceasedData);

    int hasSmsSubscription(int userCode);

    List<SubscriptionSummaryDTO> findSubscriptionSummaryByUserCode(int userCode);

    List<RecentContentsDTO> findRecentContentsBySubscriptionCode(int subscriptionCode);

}
