package com.navi.security.controller;

import com.navi.common.response.ApiResponse;
import com.navi.security.util.JWTUtil;
import com.navi.user.dto.auth.JWTClaimDTO;
import com.navi.user.dto.response.LoginResponseDTO;
import com.navi.user.dto.response.UserResponseDTO;
import com.navi.user.enums.UserState;
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

            // Refresh Token 추출
            String refreshToken = header.replace("Bearer ", "").trim();

            // 만료된 토큰도 Claims를 파싱할 수 있게 parseClaims() 사용
            Claims claims = jwtUtil.parseToken(refreshToken);

            // 실제 만료 여부 확인
            if (jwtUtil.isExpired(refreshToken)) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "REFRESH_TOKEN_EXPIRED"));
            }

            // Claim에서 사용자 정보 복원
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
                    .no(((Number) claims.get("no")).longValue())
                    .id((String) claims.get("id"))
                    .name((String) claims.get("name"))
                    .email((String) claims.get("email"))
                    .phone((String) claims.get("phone"))
                    .birth((String) claims.get("birth"))
                    .provider((String) claims.get("provider"))
                    .role(roles)
                    .state(claims.get("state") != null
                            ? UserState.valueOf((String) claims.get("state"))
                            : UserState.NORMAL)
                    .build();

            // 새 AccessToken 발급 (테스트용 10초 or 정상 10분)
            String newAccessToken = jwtUtil.generateToken(claimDTO, 60); // 단위: 초 or 분은 JWTUtil 설정에 맞게

            UserResponseDTO userResponse = UserResponseDTO.builder()
                    .no(claimDTO.getNo())
                    .id(claimDTO.getId())
                    .name(claimDTO.getName())
                    .email(claimDTO.getEmail())
                    .phone(claimDTO.getPhone())
                    .birth(claimDTO.getBirth())
                    .userState(claimDTO.getState())
                    .token(newAccessToken)
                    .build();

            // 응답 DTO 구성
            LoginResponseDTO response = LoginResponseDTO.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .user(userResponse)
                    .build();

            // 새 AccessToken 응답
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "INVALID_REFRESH_TOKEN"));
        }
    }
}
