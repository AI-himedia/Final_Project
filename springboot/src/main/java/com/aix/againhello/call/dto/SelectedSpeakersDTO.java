package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 선택된 화자 목록 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelectedSpeakersDTO {

    private int subscriptionCode;
    private List<SelectedSpeakerDTO> selections = new ArrayList<>();

}
