// oauth.kakao.KakaoAuthService
package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.HttpServletResponse;

public interface KakaoAuthService {
    User getKakaoUser(String code);
    void processLogin(User user, HttpServletResponse response);
}