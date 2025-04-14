// KakaoAuthService.java
package com.aix.againhello.oauth.kakao.service;

import com.aix.againhello.oauth.kakao.dto.User;
import java.util.Map;

public interface KakaoAuthService {
    User getKakaoUser(String code);
    void processLogin(User user, jakarta.servlet.http.HttpServletResponse response);

    // 디버깅용: Kakao로부터 받은 전체 데이터를 반환하는 메서드 추가
    Map<String, Object> getKakaoUserData(String code);
}