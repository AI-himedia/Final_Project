// oauth.kakao.User
package com.aix.againhello.oauth.kakao.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private Integer code;
    private String oauth;
    private String email;
    private String gender;
    private String fullName;
    private String number;
    private Boolean admin;
    private LocalDateTime createDate;
    private Boolean status;
    private String refreshToken;
}
