<<<<<<<< HEAD:springboot/src/main/java/com/aix/againhello/sms/responseWrapper/SmsInitResponse.java
package com.aix.againhello.sms.responseWrapper;
========
package com.aix.againhello.sms.wrapper;
>>>>>>>> e45f052bedb84a4524582e0402176ef505980401:springboot/src/main/java/com/aix/againhello/sms/wrapper/SmsInitResponse.java

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
