package com.aix.againhello.oauth;

import com.aix.againhello.oauth.kakao.JwtProvider;
import com.aix.againhello.oauth.kakao.Member;
import com.aix.againhello.oauth.kakao.MemberMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final JwtProvider jwtProvider;
    private final MemberMapper memberMapper;

    @GetMapping("/me")
    public ResponseEntity<?> getMemberInfo(HttpServletRequest request) {
        String accessToken = jwtProvider.extractAccessTokenFromRequest(request);
        if (accessToken == null || !jwtProvider.validateToken(accessToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = jwtProvider.getEmailFromToken(accessToken);
        return ResponseEntity.ok(Map.of("email", email));
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtProvider.extractRefreshTokenFromRequest(request);

        if (refreshToken == null || !jwtProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED)
                    .body(Map.of("error", "INVALID_REFRESH_TOKEN"));
        }

        String email = jwtProvider.getEmailFromToken(refreshToken);
        Member member = memberMapper.findByEmail(email);

        if (member == null) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED)
                    .body(Map.of("error", "NO_USER"));
        }

        String newAccess = jwtProvider.generateAccessToken(member);
        jwtProvider.sendAccessTokenToCookie(response, newAccess);

        return ResponseEntity.ok().build();
    }

}
