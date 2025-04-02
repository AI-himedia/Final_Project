package com.aix.againhello.sms;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SmsMapper {

    int insertDeceasedData(DeceasedDataDTO deceasedData);
}
