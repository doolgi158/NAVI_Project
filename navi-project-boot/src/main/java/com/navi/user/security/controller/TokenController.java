package com.navi.user.security.controller;

import com.navi.user.dto.JWTClaimDTO;
import com.navi.user.security.util.JWTUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class TokenController {
    private final JWTUtil jwtUtil;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestHeader("Authorization") String header) {
        try {
            if (header == null || !header.startsWith("Bearer ")) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "INVALID_HEADER"));
            }

            // 🔹 Refresh Token 추출
            String refreshToken = header.replace("Bearer ", "").trim();
            log.info("+++++++++++++++++++++++++++++++++++++++++++++++ refresh token: {}", refreshToken);

            // 🔹 만료된 토큰도 Claims를 파싱할 수 있게 parseClaims() 사용
            Claims claims = jwtUtil.parseClaims(refreshToken);

            log.info("+++++++++++++++++RAW Authorization header = [{}]", header);
            log.info("+++++++++++++++++Extracted refresh token = [{}]", refreshToken);
            log.info("+++++++++++++++++Length of refresh token = {}", refreshToken.length());

            // 🔹 실제 만료 여부 확인
            if (jwtUtil.isExpired(refreshToken)) {
                log.warn("❌ Refresh token expired at: {}", claims.getExpiration());
                return ResponseEntity.status(401)
                        .body(Map.of("error", "REFRESH_TOKEN_EXPIRED"));
            }

            // 🔹 Claim에서 사용자 정보 복원
            Object roleObj = claims.get("role");
            List<String> roles;
            if (roleObj instanceof List<?> list) {
                roles = list.stream().map(Object::toString).toList();
            } else if (roleObj instanceof String s) {
                roles = List.of(s);
            } else {
                roles = List.of("USER");
            }

            JWTClaimDTO claimDTO = JWTClaimDTO.builder()
                    .id((String) claims.get("id"))
                    .name((String) claims.get("name"))
                    .email((String) claims.get("email"))
                    .role(roles)
                    .state(null) // 필요시 추가
                    .build();

            // 🔹 새 AccessToken 발급 (테스트용 10초 or 정상 10분)
            String newAccessToken = jwtUtil.generateToken(claimDTO, 60); // 단위: 초 or 분은 JWTUtil 설정에 맞게
            claimDTO.setAccessToken(newAccessToken);
            claimDTO.setRefreshToken(refreshToken); // 기존 refresh 그대로 유지

            log.info("✅ AccessToken 재발급 완료: {}", newAccessToken);

            // 🔹 새 AccessToken 응답
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "AccessToken refreshed successfully",
                    "accessToken", newAccessToken,
                    "refreshToken", refreshToken,
                    "id", claimDTO.getId(),
                    "roles", claimDTO.getRole()
            ));

        } catch (Exception e) {
            log.error("❌ RefreshToken 검증 실패: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(Map.of("error", "INVALID_REFRESH_TOKEN"));
        }
    }
}
