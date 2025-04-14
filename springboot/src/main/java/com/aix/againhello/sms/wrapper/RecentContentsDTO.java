<<<<<<<< HEAD:springboot/src/main/java/com/aix/againhello/sms/responseWrapper/RecentContentsDTO.java
package com.aix.againhello.sms.responseWrapper;
========
package com.aix.againhello.sms.wrapper;
>>>>>>>> e45f052bedb84a4524582e0402176ef505980401:springboot/src/main/java/com/aix/againhello/sms/wrapper/RecentContentsDTO.java

import java.time.LocalDateTime;

public class RecentContentsDTO {
    private String role;               // "user" 또는 "ai"
    private String content;
    private LocalDateTime messageTime;

    public RecentContentsDTO() {
    }

    public RecentContentsDTO(String role, String content, LocalDateTime messageTime) {
        this.role = role;
        this.content = content;
        this.messageTime = messageTime;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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
        return "RecentContentsDTO{" +
                "role='" + role + '\'' +
                ", content='" + content + '\'' +
                ", messageTime=" + messageTime +
                '}';
    }
}
