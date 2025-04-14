<<<<<<<< HEAD:springboot/src/main/java/com/aix/againhello/sms/responseWrapper/ChatRequestDTO.java
package com.aix.againhello.sms.responseWrapper;
========
package com.aix.againhello.sms.wrapper;
>>>>>>>> e45f052bedb84a4524582e0402176ef505980401:springboot/src/main/java/com/aix/againhello/sms/wrapper/ChatRequestDTO.java

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
