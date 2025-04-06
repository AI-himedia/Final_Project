package com.aix.againhello.sms;

import java.time.LocalDateTime;
import java.util.List;

public class ContentsDTO {

    public int code;                 // content 고유 식별자
    public int subscriptionCode;     // subscription 고유 식별자 (FK)

    public String role;              // user 또는 ai
    public String serviceType;       // 문자(sms) 또는 전화(call)

    public LocalDateTime messageTime;         // 메시지 시간 (TIMESTAMP)
    public String content;           // 내용

    // vectorization은 실제 전달할 때 JSON 배열로 직렬화됨 (float[] 또는 List<Float>)
    public List<Float> vectorization;    // 벡터화 content


    public ContentsDTO() {
    }

    public ContentsDTO(int code, int subscriptionCode, String role, String serviceType, LocalDateTime messageTime, String content, List<Float> vectorization) {
        this.code = code;
        this.subscriptionCode = subscriptionCode;
        this.role = role;
        this.serviceType = serviceType;
        this.messageTime = messageTime;
        this.content = content;
        this.vectorization = vectorization;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDateTime getMessageTime() {
        return messageTime;
    }

    public void setMessageTime(LocalDateTime messageTime) {
        this.messageTime = messageTime;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<Float> getVectorization() {
        return vectorization;
    }

    public void setVectorization(List<Float> vectorization) {
        this.vectorization = vectorization;
    }

    @Override
    public String toString() {
        return "ContentsDTO{" +
                "code=" + code +
                ", subscriptionCode=" + subscriptionCode +
                ", role='" + role + '\'' +
                ", serviceType='" + serviceType + '\'' +
                ", messageTime=" + messageTime +
                ", content='" + content + '\'' +
                ", vectorization=" + vectorization +
                '}';
    }
}
