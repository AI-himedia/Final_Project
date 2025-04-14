package com.aix.againhello.sms.wrapper;

import java.util.List;

public class SmsInitResponse {
    private String status;
    private String message;
    private List<SubscriptionSummaryDTO> subscriptionSummaryDTOList;

    public SmsInitResponse() {
    }

    public SmsInitResponse(String status, String message, List<SubscriptionSummaryDTO> subscriptionSummaryDTOList) {
        this.status = status;
        this.message = message;
        this.subscriptionSummaryDTOList = subscriptionSummaryDTOList;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<SubscriptionSummaryDTO> getSubscriptionSummaryDTOList() {
        return subscriptionSummaryDTOList;
    }

    public void setSubscriptionSummaryDTOList(List<SubscriptionSummaryDTO> subscriptionSummaryDTOList) {
        this.subscriptionSummaryDTOList = subscriptionSummaryDTOList;
    }

    @Override
    public String toString() {
        return "SmsInitResponse{" +
                "status='" + status + '\'' +
                ", message='" + message + '\'' +
                ", subscriptionSummaryDTOList=" + subscriptionSummaryDTOList +
                '}';
    }
}
