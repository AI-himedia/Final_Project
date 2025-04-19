package com.aix.againhello.oauth.kakao.controller;

import com.aix.againhello.oauth.kakao.jwt.JwtUtil;
import com.aix.againhello.oauth.kakao.dto.SignupRequest;
import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/be/member")
public class SignupController {

    private static final Logger logger = LoggerFactory.getLogger(SignupController.class);
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public SignupController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest signupRequest,
                         HttpServletResponse response) {
        logger.info("회원가입 요청 수신: {}", signupRequest.getEmail());

        User user = User.builder()
                .oauth("KAKAO")
                .email(signupRequest.getEmail())
                .gender(signupRequest.getGender())
                .fullName(signupRequest.getFullName())
                .number(signupRequest.getNumber())
                .admin(false)
                .status(false)
                .build();

        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());
        user.setRefreshToken(refreshToken);
        userService.save(user);

        String accessToken = jwtUtil.createAccessToken(user.getEmail());
        jwtUtil.setJwtCookies(response, accessToken, refreshToken);

        logger.info("회원가입 후 JWT 쿠키 설정 완료");

        return "회원가입 완료";
    }
}
