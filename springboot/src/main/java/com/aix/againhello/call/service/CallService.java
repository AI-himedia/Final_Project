package com.aix.againhello.call.service;

import com.aix.againhello.call.dto.ServiceRequestDTO;
import com.aix.againhello.call.mapper.CallMapper;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.exception.ServiceException;
import com.aix.againhello.common.SubscriptionDTO;
import com.aix.againhello.oauth.kakao.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class CallService {
    private static final int SMS_SERVICE_CODE = 1;
    private static final int CALL_SERVICE_CODE = 2;

    @Autowired
    private CallMapper callMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * 서비스 신청 처리 메소드
     *
     * @param userCode 사용자 코드
     * @param serviceRequestDto 서비스 요청 정보
     * @param audioFiles 음성/영상 파일 목록
     * @return 생성된 구독 정보
     */
    @Transactional
    public SubscriptionDTO startService(int userCode, ServiceRequestDTO serviceRequestDto,
                                        List<MultipartFile> audioFiles) {

        // 1. 사용자 존재 여부 확인
        if (!userMapper.existsById(userCode)) {
            throw new ServiceException("사용자를 찾을 수 없습니다.");
        }

        // 2. 전화 서비스를 신청하는지 확인
        if (serviceRequestDto.getServiceCode() != CALL_SERVICE_CODE) {
            throw new ServiceException("이 메소드는 전화 서비스 신청만 처리합니다.");
        }

        // 3. 현재 활성화된 구독 상태 확인
        SubscriptionDTO existingCallSubscription = callMapper.findActiveSubscription(
                userCode, CALL_SERVICE_CODE);

        SubscriptionDTO existingSmsSubscription = callMapper.findActiveSubscription(
                userCode, SMS_SERVICE_CODE);

        // 시나리오 분기 처리
        if (existingCallSubscription != null) {
            // [이미 전화서비스를 사용중] - 새로운 고인과의 전화 서비스 신청
            return processNewUserCallService(userCode, serviceRequestDto, audioFiles);
        } else if (existingSmsSubscription != null) {
            // [문자 서비스 사용O, 전화 서비스 사용X] - 기존 고인과의 전화 서비스 신청
            return processCallServiceExistingForSmsUser(userCode, serviceRequestDto, audioFiles, existingSmsSubscription);
        } else {
            // [전화 서비스 사용X, 문자 서비스 사용X] - 새로운 고인과의 전화 서비스 신청
            return processNewUserCallService(userCode, serviceRequestDto, audioFiles);
        }
    }

    /**
     * 사용자의 새로운 전화 서비스 등록 처리 (문자 서비스 사용X -> 기존 고인 데이터X)
     */
    @Transactional
    protected SubscriptionDTO processNewUserCallService(int userCode, ServiceRequestDTO serviceRequestDto,
                                                                    List<MultipartFile> audioFiles) {
        // 새로운 고인 데이터 등록
        DeceasedDataDTO deceasedDataDto = serviceRequestDto.getDeceasedData();
        if (deceasedDataDto == null) {
            throw new ServiceException("고인 데이터가 필요합니다.");
        }

        DeceasedDataDTO deceasedData = createDeceasedDataFromDto(deceasedDataDto);
        callMapper.insertDeceasedData(deceasedData);
        int deceasedCode = deceasedData.getDeceasedCode();

        // 새로운 전화 서비스 구독 정보 생성
        SubscriptionDTO subscription = createSubscription(userCode, CALL_SERVICE_CODE, deceasedCode);

        // 파일 업로드 처리
        processAudioFiles(subscription.getSubscriptionCode(), subscription.getDeceasedCode(), audioFiles);

        return subscription;
    }

    /**
     * 문자 서비스 사용 중인 기존 고인과의 전화 서비스 등록 처리 (기존 고인 데이터O)
     */
    @Transactional
    protected SubscriptionDTO processCallServiceExistingForSmsUser(int userCode, ServiceRequestDTO serviceRequestDto,
                                                           List<MultipartFile> audioFiles, SubscriptionDTO existingSmsSubscription) {
        Integer deceasedCode;

        // 고인 데이터 처리
        if (serviceRequestDto.isUsingSameDeceased()) {
            // 기존 SMS 서비스의 고인 데이터 사용
            if (existingSmsSubscription.getDeceasedCode() == null) {
                throw new ServiceException("기존 SMS 서비스에 고인 데이터가 없습니다.");
            }
            deceasedCode = existingSmsSubscription.getDeceasedCode();
        } else {
            // 새로운 고인 데이터 등록
            DeceasedDataDTO deceasedDataDto = serviceRequestDto.getDeceasedData();
            if (deceasedDataDto == null) {
                throw new ServiceException("고인 데이터가 필요합니다.");
            }

            DeceasedDataDTO deceasedData = createDeceasedDataFromDto(deceasedDataDto);
            callMapper.insertDeceasedData(deceasedData);
            deceasedCode = deceasedData.getDeceasedCode();
        }

        // 전화 서비스 구독 정보 생성
        SubscriptionDTO subscription = createSubscription(userCode, CALL_SERVICE_CODE, deceasedCode);

        // 파일 업로드 처리
        processAudioFiles(subscription.getSubscriptionCode(), subscription.getDeceasedCode(), audioFiles);

        return subscription;
    }

    /**
     * 고인 데이터 생성 헬퍼 메서드
     */
    private DeceasedDataDTO createDeceasedDataFromDto(DeceasedDataDTO source) {
        DeceasedDataDTO deceasedData = new DeceasedDataDTO();
        deceasedData.setDeceasedName(source.getDeceasedName());
        deceasedData.setGender(source.getGender());
        deceasedData.setDeceasedAge(source.getDeceasedAge());
        deceasedData.setPersonality(source.getPersonality());
        deceasedData.setDeceasedNickname(source.getDeceasedNickname());
        deceasedData.setUserNickname(source.getUserNickname());
        deceasedData.setRelationship(source.getRelationship());
        deceasedData.setSpeakingTone(source.getSpeakingTone());
        deceasedData.setToneStyle(source.getToneStyle());
        deceasedData.setCommonPhrases(source.getCommonPhrases());
        deceasedData.setExampleLines(source.getExampleLines());
        return deceasedData;
    }

    /**
     * 구독 정보 생성 헬퍼 메서드
     */
    private SubscriptionDTO createSubscription(int userCode, int serviceCode, int deceasedCode) {
        SubscriptionDTO subscription = new SubscriptionDTO();
        subscription.setUserCode(userCode);
        subscription.setServiceCode(serviceCode);
        subscription.setDeceasedCode(deceasedCode);

        callMapper.insertSubscription(subscription);
        return subscription;
    }

    /**
     * 음성/영상 파일 업로드 처리 헬퍼 메서드
     */
    private void processAudioFiles(int subscriptionCode, int deceasedCode, List<MultipartFile> audioFiles) {
        if (audioFiles != null && !audioFiles.isEmpty()) {
            // 파일 유효성 검증
            fileStorageService.validateFiles(audioFiles);

            List<String> audioFilePaths = new ArrayList<>();

            for (MultipartFile file : audioFiles) {
                if (!file.isEmpty()) {
                    String filePath = fileStorageService.storeFile(file, "audio", deceasedCode);
                    audioFilePaths.add(filePath);
                }
            }
        }
    }
}