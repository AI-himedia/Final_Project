// oauth.kakao.UserServicelmpl
package com.aix.againhello.oauth.kakao.service;

import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
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
        logger.info("User saved with email: {}", user.getEmail());
    }

    @Override
    public void updateRefreshToken(String email, String refreshToken) {
        userMapper.updateRefreshToken(email, refreshToken);

    }

    @Override
    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public void withdraw(String email) {
        userMapper.deactivate(email);
        logger.info("User deactivated with email: {}", email);
    }
}
