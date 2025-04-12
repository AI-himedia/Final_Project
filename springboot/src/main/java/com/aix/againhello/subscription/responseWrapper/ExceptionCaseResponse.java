package com.aix.againhello.subscription.responseWrapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class ExceptionCaseResponse {
    private Integer subscriptionCode;
    private Integer serviceCode;

    public ExceptionCaseResponse() {
    }

    public ExceptionCaseResponse(Integer subscriptionCode, Integer serviceCode) {
        this.subscriptionCode = subscriptionCode;
        this.serviceCode = serviceCode;
    }

    public Integer getSubscriptionCode() {
        return subscriptionCode;
    }

    public void setSubscriptionCode(Integer subscriptionCode) {
        this.subscriptionCode = subscriptionCode;
    }

    public Integer getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(Integer serviceCode) {
        this.serviceCode = serviceCode;
    }

    @Override
    public String toString() {
        return "ExceptionCaseResponse{" +
                "subscriptionCode=" + subscriptionCode +
                ", serviceCode=" + serviceCode +
                '}';
    }
}
