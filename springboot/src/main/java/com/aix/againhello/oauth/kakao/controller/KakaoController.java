package com.aix.againhello.oauth.kakao.controller;

import com.aix.againhello.oauth.kakao.dto.User;
import com.aix.againhello.oauth.kakao.service.KakaoAuthService;
import com.aix.againhello.oauth.kakao.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
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

    /**
     * 카카오 로그인 코드 전달 시 사용자 정보 조회 후,
     * 기존 회원이면 로그인 처리, 아니면 회원가입 유도
     */
    @GetMapping("/token")
    public ResponseEntity<?> handleKakaoLogin(@RequestParam("code") String code, HttpServletResponse response) {
        try {
            User user = kakaoAuthService.getKakaoUser(code);

            boolean exists = userService.existsByEmail(user.getEmail());
            if (exists) {
                System.out.println("기존 회원, 로그인 처리 시작");
                kakaoAuthService.processLogin(user, response);
                return ResponseEntity.ok("기존 회원 로그인 성공");
            } else {
                System.out.println("신규 회원, 회원가입 필요");
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(user); // 202 Accepted
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("카카오 로그인 처리 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 신규 회원가입 처리 + 자동 로그인
     */
    @PostMapping("/signup")
    public ResponseEntity<?> completeSignup(@RequestBody User user, HttpServletResponse response) {
        try {
            userService.save(user);
            kakaoAuthService.processLogin(user, response);
            return ResponseEntity.ok("신규 회원가입 및 로그인 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원가입 처리 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 회원 탈퇴 처리
     */
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody String email) {
        try {
            userService.deactivate(email);
            return ResponseEntity.ok("회원 탈퇴 처리 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원 탈퇴 처리 중 오류 발생: " + e.getMessage());
        }
    }
}
