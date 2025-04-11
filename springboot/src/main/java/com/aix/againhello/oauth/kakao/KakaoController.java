// oauth.kakao.KakaoController
package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/be/member/kakao")
public class KakaoController {
    private final KakaoAuthService kakaoAuthService;
    private final UserService userService;

    public KakaoController(KakaoAuthService kakaoAuthService, UserService userService) {
        this.kakaoAuthService = kakaoAuthService;
        this.userService = userService;
    }

    @GetMapping("/token")
    public ResponseEntity<?> handleKakaoLogin(@RequestParam("code") String code, HttpServletResponse response) {
        User user = kakaoAuthService.getKakaoUser(code);

        boolean exists = userService.existsByEmail(user.getEmail());
        if (exists) {
            System.out.println("기존 회원, 로그인 처리 시작");
            kakaoAuthService.processLogin(user, response);
            return ResponseEntity.ok("기존 회원 로그인 성공"); // 200 전달
        } else {
            System.out.println("신규 회원, 회원가입 필요");
            return ResponseEntity.status(202).body(user); // 회원가입 페이지 202 전달
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> completeSignup(@RequestBody User user, HttpServletResponse response) {
        userService.save(user);
        kakaoAuthService.processLogin(user, response);
        return ResponseEntity.ok("신규 회원가입 및 로그인 완료");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody String email) {
        userService.deactivate(email);
        return ResponseEntity.ok("회원 탈퇴 처리 완료");
    }
}