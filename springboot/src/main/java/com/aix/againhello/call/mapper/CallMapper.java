package com.aix.againhello.call.mapper;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.RawFileDTO;
import com.aix.againhello.common.SubscriptionDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CallMapper {

    SubscriptionDTO findActiveSubscription(int userCode, int serviceCode);
    void insertDeceasedData(DeceasedDataDTO deceasedData);
    void insertSubscription(SubscriptionDTO subscription);
    void insertRawFile(RawFileDTO rawFile);

}
