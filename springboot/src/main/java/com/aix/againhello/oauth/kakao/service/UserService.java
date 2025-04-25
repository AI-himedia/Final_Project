// oauth.kakao.UserService
package com.aix.againhello.oauth.kakao.service;

import com.aix.againhello.oauth.kakao.dto.User;


public interface UserService {
    boolean existsByEmail(String email);
    void save(User user);
    void updateRefreshToken(String email, String refreshToken);
    void withdraw(String email);
    User findByEmail(String email);
}
