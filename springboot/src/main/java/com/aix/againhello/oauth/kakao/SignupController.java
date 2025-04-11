// oauth.kakao.SignupController
package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/be/member")
public class SignupController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public SignupController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest signupRequest,
                         HttpServletResponse response) {

        System.out.println("✅ 회원가입 요청 수신: " + signupRequest.getEmail());

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

        System.out.println("✅ 회원가입 후 JWT 쿠키 설정 완료");

        return "회원가입 완료";
    }
}