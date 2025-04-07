package com.aix.againhello.common;

public class RawFileDTO {
    private int code;  // 초 기 데이터 파일 고유 식별자
    private int subscriptionCode;  // 해당 구독을 참조하는 식별자 (FK)
    private String audioFilePaths;  // 오디오 파일 데이터 저장 주소
    private String smsFilePaths;    // 대화록 데이터 저장 주소

    public RawFileDTO() {
    }

    public RawFileDTO(int code, int subscriptionCode, String audioFilePaths, String smsFilePaths) {
        this.code = code;
        this.subscriptionCode = subscriptionCode;
        this.audioFilePaths = audioFilePaths;
        this.smsFilePaths = smsFilePaths;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public int getSubscriptionCode() {
        return subscriptionCode;
    }

    public void setSubscriptionCode(int subscriptionCode) {
        this.subscriptionCode = subscriptionCode;
    }

    public String getAudioFilePaths() {
        return audioFilePaths;
    }

    public void setAudioFilePaths(String audioFilePaths) {
        this.audioFilePaths = audioFilePaths;
    }

    public String getSmsFilePaths() {
        return smsFilePaths;
    }

    public void setSmsFilePaths(String smsFilePaths) {
        this.smsFilePaths = smsFilePaths;
    }

    @Override
    public String toString() {
        return "RawFileDTO{" +
                "code=" + code +
                ", subscriptionCode=" + subscriptionCode +
                ", audioFilePaths='" + audioFilePaths + '\'' +
                ", smsFilePaths='" + smsFilePaths + '\'' +
                '}';
    }
}
