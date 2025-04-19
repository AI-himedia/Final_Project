package com.aix.againhello.sms.wrapper;
import java.time.LocalDateTime;

public class SubscriptionSummaryDTO {

    public Integer subscriptionCode;
    public String name;       // 고인 이름 (nullable)
    public String content;      // 가장 최근 메시지 (nullable)
    public LocalDateTime messageTime;          // 가장 최근 메시지의 시간 (nullable)

    public SubscriptionSummaryDTO() {
    }

    public SubscriptionSummaryDTO(Integer subscriptionCode, String name, String content, LocalDateTime messageTime) {
        this.subscriptionCode = subscriptionCode;
        this.name = name;
        this.content = content;
        this.messageTime = messageTime;
    }

    public Integer getSubscriptionCode() {
        return subscriptionCode;
    }

    public void setSubscriptionCode(Integer subscriptionCode) {
        this.subscriptionCode = subscriptionCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getMessageTime() {
        return messageTime;
    }

    public void setMessageTime(LocalDateTime messageTime) {
        this.messageTime = messageTime;
    }

    @Override
    public String toString() {
        return "SubscriptionSummaryDTO{" +
                "subscriptionCode=" + subscriptionCode +
                ", name='" + name + '\'' +
                ", content='" + content + '\'' +
                ", messageTime=" + messageTime +
                '}';
    }
}

