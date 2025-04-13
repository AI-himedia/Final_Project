package com.aix.againhello.oauth.kakao.controller;

import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.jwt.JwtUtil;
import com.aix.againhello.oauth.kakao.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/be/member")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user, HttpServletResponse response) {
        userService.save(user); // 회원가입 DB 저장

        String accessToken = jwtUtil.createAccessToken(user.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());
        jwtUtil.setJwtCookies(response, accessToken, refreshToken);

        userService.updateRefreshToken(user.getEmail(), refreshToken);
        logger.info("회원 등록 및 쿠키 설정 완료 for user: {}", user.getEmail());
        return user;
    }

    @PutMapping("/withdraw")
    public String withdraw(@RequestParam String email) {
        userService.withdraw(email);
        logger.info("회원 탈퇴 완료 for email: {}", email);
        return "회원 탈퇴 완료";
    }
}
