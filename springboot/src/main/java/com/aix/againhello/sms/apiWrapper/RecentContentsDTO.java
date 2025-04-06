package com.aix.againhello.sms.apiWrapper;

import java.time.LocalDateTime;

public class RecentContentsDTO {
    public String role;               // "user" 또는 "ai"
    public String content;
    public LocalDateTime messageTime;

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
