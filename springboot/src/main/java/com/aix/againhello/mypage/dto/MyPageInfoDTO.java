package com.aix.againhello.mypage.dto;

import com.aix.againhello.common.DeceasedDetailDTO;
import com.aix.againhello.oauth.kakao.dto.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyPageInfoDTO {

    private User user;
    private List<DeceasedDetailDTO> deceasedList;

}
