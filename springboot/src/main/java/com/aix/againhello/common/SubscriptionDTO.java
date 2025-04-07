package com.aix.againhello.common;

import java.time.LocalDateTime;

public class SubscriptionDTO {

    public int subscriptionCode;  // 구독 고유 식별자
    public int userCode;          // 회원 고유 식별자
    public int serviceCode;       // 구독한 서비스의 식별자
    public int deceasedCode;      // 고인 데이터 고유 식별자

    public LocalDateTime startDate;      // 구독 시작 날짜
    public LocalDateTime endDate;        // 구독 종료 날짜
    public LocalDateTime cancelDate;     // 구독 취소 신청 날짜

    public SubscriptionDTO() {
    }

    public SubscriptionDTO(int subscriptionCode, int userCode, int serviceCode, int deceasedCode, LocalDateTime startDate, LocalDateTime endDate, LocalDateTime cancelDate) {
        this.subscriptionCode = subscriptionCode;
        this.userCode = userCode;
        this.serviceCode = serviceCode;
        this.deceasedCode = deceasedCode;
        this.startDate = startDate;
        this.endDate = endDate;
        this.cancelDate = cancelDate;
    }

    public int getSubscriptionCode() {
        return subscriptionCode;
    }

    public void setSubscriptionCode(int subscriptionCode) {
        this.subscriptionCode = subscriptionCode;
    }

    public int getUserCode() {
        return userCode;
    }

    public void setUserCode(int userCode) {
        this.userCode = userCode;
    }

    public int getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(int serviceCode) {
        this.serviceCode = serviceCode;
    }

    public int getDeceasedCode() {
        return deceasedCode;
    }

    public void setDeceasedCode(int deceasedCode) {
        this.deceasedCode = deceasedCode;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getCancelDate() {
        return cancelDate;
    }

    public void setCancelDate(LocalDateTime cancelDate) {
        this.cancelDate = cancelDate;
    }

    @Override
    public String toString() {
        return "SubscriptionDTO{" +
                "subscriptionCode=" + subscriptionCode +
                ", userCode=" + userCode +
                ", serviceCode=" + serviceCode +
                ", deceasedCode=" + deceasedCode +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", cancelDate=" + cancelDate +
                '}';
    }
}
