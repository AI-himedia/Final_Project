package com.aix.againhello.sms.wrapper;


public class ChatRequestDTO {
    private int subscriptionCode;
    private String userInput;

    public ChatRequestDTO() {
    }

    public ChatRequestDTO(int subscriptionCode, String userInput) {
        this.subscriptionCode = subscriptionCode;
        this.userInput = userInput;
    }

    public int getSubscriptionCode() {
        return subscriptionCode;
    }

    public void setSubscriptionCode(int subscriptionCode) {
        this.subscriptionCode = subscriptionCode;
    }

    public String getUserInput() {
        return userInput;
    }

    public void setUserInput(String userInput) {
        this.userInput = userInput;
    }

    @Override
    public String toString() {
        return "ChatRequestDTO{" +
                "subscriptionCode=" + subscriptionCode +
                ", userInput='" + userInput + '\'' +
                '}';
    }
}
