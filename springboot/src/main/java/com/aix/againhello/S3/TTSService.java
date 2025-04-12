package com.aix.againhello.S3;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TTSService {

    private final TTSMapper ttsMapper;
    public String getAudioPathBySubscriptionCode(int subscriptionCode) {
        return ttsMapper.findAudioFilePathBySubscriptionCode(subscriptionCode);
    }
}
