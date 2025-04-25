package com.aix.againhello.call.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelectedSpeakersDTO {

    private int subscriptionCode;
    private int serviceCode;
    private List<SelectedSpeakerDTO> selections = new ArrayList<>();

}
