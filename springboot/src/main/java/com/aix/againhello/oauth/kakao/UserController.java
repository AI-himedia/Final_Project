// oauth.kakao.UserController
package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/be/member")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public User signup(@RequestBody User user, HttpServletResponse response) {
        userService.save(user); // 회원가입 DB 저장

        // 쿠키 저장
        String accessToken = jwtUtil.createAccessToken(user.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());
        jwtUtil.setJwtCookies(response, accessToken, refreshToken);

        userService.updateRefreshToken(user.getEmail(), refreshToken);
        return user;
    }

    @PutMapping("/withdraw")
    public String withdraw(@RequestParam String email) {
        userService.withdraw(email);
        return "회원 탈퇴 완료";
    }

}
