package com.aix.againhello.oauth.kakao;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController

@RequiredArgsConstructor
@RequestMapping("/api/member/kakao")
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;

    @GetMapping("/token")
    public ResponseEntity<?> kakaoCallback(@RequestParam String code, HttpServletResponse response) {
        String email = kakaoAuthService.kakaoLogin(code, response);

        // 프론트에서 사용할 데이터 포함해서 응답
        return ResponseEntity.ok(Map.of(
                "email", email
        ));
    }
}
