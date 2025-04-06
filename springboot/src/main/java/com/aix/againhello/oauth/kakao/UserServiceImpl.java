// oauth.kakao.UserServicelmpl
package com.aix.againhello.oauth.kakao;

import com.aix.againhello.oauth.kakao.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.findByEmail(email) != null;
    }

    @Override
    public void save(User user) {
        userMapper.save(user);
    }

    @Override
    public void updateRefreshToken(String email, String refreshToken) {
        userMapper.updateRefreshToken(email, refreshToken);
    }

    @Override
    public void deactivate(String email) {
        userMapper.deactivate(email);
    }

    @Override
    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public void withdraw(String email) {
        userMapper.deactivate(email);
    }

}
