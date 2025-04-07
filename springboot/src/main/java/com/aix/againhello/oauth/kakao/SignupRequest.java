// oauth.kakao.SignupRequest
package com.aix.againhello.oauth.kakao;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    private String email;
    private String gender;    // "M" or "F"
    private String fullName;
    private String number;    // 전화번호
}
