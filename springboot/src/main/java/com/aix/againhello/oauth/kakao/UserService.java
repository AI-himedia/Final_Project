// oauth.kakao.UserService
package com.aix.againhello.oauth.kakao;

public interface UserService {
    boolean existsByEmail(String email);
    void save(User user);
    void updateRefreshToken(String email, String refreshToken);
    void deactivate(String email);
    void withdraw(String email);
    User findByEmail(String email);
}