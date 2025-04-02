package com.aix.againhello.sms;

import java.util.List;

public class DeceasedDataDTO {

    private int deceasedCode;
    private String name;
    private char gender;
    private int age;
    private String personality;
    private String deceasedNickname;
    private String userNickname;
    private String relationship;
    private boolean speakingTone;
    private List<Float> voiceEmbedding;
    private String prompt;


    public DeceasedDataDTO() {
    }

    public DeceasedDataDTO(int deceasedCode, String name, char gender, int age, String personality, String deceasedNickname, String userNickname, String relationship, boolean speakingTone, List<Float> voiceEmbedding, String prompt) {
        this.deceasedCode = deceasedCode;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.personality = personality;
        this.deceasedNickname = deceasedNickname;
        this.userNickname = userNickname;
        this.relationship = relationship;
        this.speakingTone = speakingTone;
        this.voiceEmbedding = voiceEmbedding;
        this.prompt = prompt;
    }

    public int getDeceasedCode() {
        return deceasedCode;
    }

    public void setDeceasedCode(int deceasedCode) {
        this.deceasedCode = deceasedCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public char getGender() {
        return gender;
    }

    public void setGender(char gender) {
        this.gender = gender;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }

    public String getDeceasedNickname() {
        return deceasedNickname;
    }

    public void setDeceasedNickname(String deceasedNickname) {
        this.deceasedNickname = deceasedNickname;
    }

    public String getUserNickname() {
        return userNickname;
    }

    public void setUserNickname(String userNickname) {
        this.userNickname = userNickname;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public boolean isSpeakingTone() {
        return speakingTone;
    }

    public void setSpeakingTone(boolean speakingTone) {
        this.speakingTone = speakingTone;
    }

    public List<Float> getVoiceEmbedding() {
        return voiceEmbedding;
    }

    public void setVoiceEmbedding(List<Float> voiceEmbedding) {
        this.voiceEmbedding = voiceEmbedding;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    @Override
    public String toString() {
        return "DeceasedDataDTO{" +
                "deceasedCode=" + deceasedCode +
                ", name='" + name + '\'' +
                ", gender=" + gender +
                ", age=" + age +
                ", personality='" + personality + '\'' +
                ", deceasedNickname='" + deceasedNickname + '\'' +
                ", userNickname='" + userNickname + '\'' +
                ", relationship='" + relationship + '\'' +
                ", speakingTone=" + speakingTone +
                ", voiceEmbedding=" + voiceEmbedding +
                ", prompt='" + prompt + '\'' +
                '}';
    }
}

