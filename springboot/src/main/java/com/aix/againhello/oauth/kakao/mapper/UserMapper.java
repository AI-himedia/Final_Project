// oauth.kakao.mapper.UserMapper
package com.aix.againhello.oauth.kakao.mapper;

import com.aix.againhello.oauth.kakao.dto.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    User findByEmail(String email);
    void save(User user);
    void updateRefreshToken(String email, String refreshToken);
    void deactivate(String email);
    boolean existsById(int userCode);
    User findById(int userCode);
}
