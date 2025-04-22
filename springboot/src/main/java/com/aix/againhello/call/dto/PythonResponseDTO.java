package com.aix.againhello.call.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PythonResponseDTO {

    private String text;
    private String audio;

    public PythonResponseDTO() {
    }

    public PythonResponseDTO(String text, String audio) {
        this.text = text;
        this.audio = audio;
    }

    @Override
    public String toString() {
        return "PythonResponseDTO{" +
                "text='" + text + '\'' +
                ", audio='" + audio + '\'' +
                '}';
    }
}
