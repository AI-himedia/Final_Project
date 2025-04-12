// oauth.kakao.SignupRequest
package com.aix.againhello.oauth.kakao.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    private String email;
    private String gender;
    private String fullName;
    private String number;
}
