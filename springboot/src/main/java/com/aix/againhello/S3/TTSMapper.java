package com.aix.againhello.S3;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TTSMapper {
    String findAudioFilePathBySubscriptionCode(int subscriptionCode);
}