package com.navi.user.security.controller;

import com.navi.user.security.util.JWTUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class TokenController {
    private final JWTUtil jwtUtil;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "NO_REFRESH_TOKEN"));
        }

        String refreshToken = authHeader.substring(7);

        try {
            // 리프레시 토큰 검증
            Claims claims = jwtUtil.parseClaims(refreshToken);
            String userId = (String) claims.get("id");

            // 만료 체크
            if (jwtUtil.isExpired(refreshToken)) {
                return ResponseEntity.status(401).body(Map.of("error", "REFRESH_TOKEN_EXPIRED"));
            }

            // 새 액세스 토큰 발급 (10분)
            Map<String, Object> newClaims = Map.of(
                    "id", claims.get("id"),
                    "name", claims.get("name"),
                    "email", claims.get("email"),
                    "role", claims.get("role")
            );

            String newAccessToken = jwtUtil.generateToken(newClaims, 20);

            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken,
                    "message", "ACCESS_TOKEN_REFRESHED"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "INVALID_REFRESH_TOKEN"));
        }
    }
}
