package com.aix.againhello.call.service;

import com.aix.againhello.call.dto.CallDeceasedInfoDTO;
import com.aix.againhello.call.mapper.CallMapper;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.SubscriptionDTO;
import com.aix.againhello.common.exception.ServiceException;
import com.aix.againhello.oauth.kakao.mapper.UserMapper;
import com.aix.againhello.subscription.SubscriptionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CallService {

    @Autowired
    private CallMapper callMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SubscriptionMapper subscriptionMapper;

    /**
     * 고인 정보 및 파일을 처리하는 메소드
     *
     * @param subscriptionCode 구독 코드
     * @param deceasedDataDto 고인 정보 DTO
     * @param audioFiles 음성/영상 파일 목록
     */
    @Transactional
    public void processSubscription(int subscriptionCode, DeceasedDataDTO deceasedDataDto,
                                    List<MultipartFile> audioFiles) {

        // 구독 정보 확인
        SubscriptionDTO subscription = subscriptionMapper.findSubscriptionByCode(subscriptionCode);
        if (subscription == null) {
            throw new ServiceException("유효하지 않은 구독 코드입니다: " + subscriptionCode);
        }

        Integer existingDeceasedCode = subscription.getDeceasedCode();

        // 3. 고인 데이터 처리 (Insert 또는 Update)
        Integer currentDeceasedCode;

        if (deceasedDataDto == null) {
            throw new ServiceException("고인 데이터가 필요합니다.");
        }

        if (existingDeceasedCode != null) {
            // Case 1: 구독 정보에 이미 고인 코드가 연결되어 있는 경우 (기존 고인 데이터 Update)
            if (!subscriptionMapper.existsByDeceasedCode(existingDeceasedCode)) {
                throw new ServiceException("구독에 연결된 기존 고인 코드가 유효하지 않습니다: " + existingDeceasedCode);
            }
            updateDeceasedData(existingDeceasedCode, deceasedDataDto);
            currentDeceasedCode = existingDeceasedCode;
        } else {
            // Case 2: 구독 정보에 고인 코드가 없는 경우 (새로운 고인 데이터 Insert)
            currentDeceasedCode = insertDeceasedData(deceasedDataDto);
            subscription.setDeceasedCode(currentDeceasedCode);
            subscriptionMapper.updateSubscriptionDeceasedCode(subscription);
        }

        // 음성/영상 파일 처리
        processAudioFiles(subscriptionCode, currentDeceasedCode, audioFiles);

    }

    /**
     * 고인 데이터 Insert
     */
    private int insertDeceasedData(DeceasedDataDTO deceasedDataDto) {

        DeceasedDataDTO deceasedData = createDeceasedDataFromDto(deceasedDataDto);
        callMapper.insertDeceasedData(deceasedData);
        if (deceasedData.getDeceasedCode() == null) {
            throw new ServiceException("고인 데이터 삽입 후 코드를 가져오지 못했습니다.");
        }
        return deceasedData.getDeceasedCode();

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
     * 기존 고인 데이터 Update
     */
    public void updateDeceasedData(int deceasedCode, DeceasedDataDTO deceasedDataDto) {

        deceasedDataDto.setDeceasedCode(deceasedCode);
        int updatedRows = callMapper.updateDeceasedData(deceasedDataDto);
        if (updatedRows == 0) {
            throw new ServiceException("고인 데이터 업데이트에 실패했습니다: " + deceasedCode);
        }

    }

    /**
     * 음성/영상 파일 업로드 처리
     */
    private void processAudioFiles(int subscriptionCode, int deceasedCode, List<MultipartFile> audioFiles) {

        if (audioFiles != null && !audioFiles.isEmpty()) {

            // 요청 내 중복 파일명 체크
            Set<String> uniqueFilenames = new HashSet<>();
            for (MultipartFile file : audioFiles) {
                String originalFilename = file.getOriginalFilename();

                // originalFilename이 null이거나 비어있는 경우에 대한 처리
                if (originalFilename == null || originalFilename.trim().isEmpty()) {
                    throw new ServiceException("업로드된 파일 중 이름이 없는 파일이 있습니다.");
                }

                // Set에 파일명을 추가 시도. 이미 존재하면 add()는 false를 반환.
                if (!uniqueFilenames.add(originalFilename)) {
                    // 중복 발견 시 예외 발생시켜 처리 중단
                    throw new ServiceException("파일 목록에 중복된 파일명이 포함되어 있습니다: " + originalFilename);
                }
            }

            // 파일 유효성 검증 및 저장
            try {
                fileStorageService.validateFiles(audioFiles);
                List<String> audioFilePaths = new ArrayList<>();
                for (MultipartFile file : audioFiles) {
                    if (!file.isEmpty()) {
                        String filePath = fileStorageService.storeFile(file, "audio", subscriptionCode, deceasedCode);
                        audioFilePaths.add(filePath);
                    }
                }
            } catch (ServiceException e) {
                throw e;
            } catch (Exception e) {
                throw new ServiceException("파일 처리 중 오류가 발생했습니다: " + e.getMessage());
            }
        } else {
            System.out.println("파일이 존재하지 않습니다.");
        }
    }

    /**
     * 사용자별 보이스챗 서비스 구독 고인 목록 및 최근 통화 시간 조회
     */
    @Transactional(readOnly = true)
    public List<CallDeceasedInfoDTO> getCallServiceDeceasedListByUser(int userCode) {

        if (!userMapper.existsById(userCode)) {
            throw new ServiceException("사용자를 찾을 수 없습니다: " + userCode);
        }

        return callMapper.findDeceasedListForCallServiceByUser(userCode);

    }

    /**
     * 사용자별 전화 서비스 구독 고인 목록 및 최근 통화 시간 조회
     */
    @Transactional(readOnly = true)
    public List<CallDeceasedInfoDTO> getCallServiceDeceasedListForStreamingByUser(int userCode) {

        if (!userMapper.existsById(userCode)) {
            throw new ServiceException("사용자를 찾을 수 없습니다: " + userCode);
        }

        return callMapper.findDeceasedListForCallStreamingServiceByUser(userCode);

    }

}