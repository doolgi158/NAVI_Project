package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.HistoryDTO;
import com.navi.user.dto.SocialDTO;
import com.navi.user.dto.UserDTO;
import com.navi.user.enums.SocialState;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.util.JWTUtil;
import com.navi.user.service.social.SocialLoginService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SocialController {
    private final SocialLoginService socialLoginService;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/api/auth/oauth/{provider}")
    public ResponseEntity<Map<String, Object>> oauthLogin( @PathVariable SocialState provider, @RequestParam String code,
            HttpServletRequest request) {
        SocialDTO oauth = socialLoginService.socialLogin(provider, code);

        // 앱용 JWT (리소스 토큰과 별개)
        Map<String, Object> accessClaims = new java.util.HashMap<>();
        accessClaims.put("provider", oauth.getType() != null ? oauth.getType().name() : "UNKNOWN");
        accessClaims.put("socialNo", oauth.getNo());

        Map<String, Object> refreshClaims = new java.util.HashMap<>();
        refreshClaims.put("provider", oauth.getType() != null ? oauth.getType().name() : "UNKNOWN");
        refreshClaims.put("socialNo", oauth.getNo());
        refreshClaims.put("type", "refresh");

        String accessToken = jwtUtil.generateToken(accessClaims, 10);
        String refreshToken = jwtUtil.generateToken(refreshClaims, 60 * 24);

        // 사용자 정보 및 IP 포함 응답 구성
        String username = provider.name().toLowerCase() + "_user";
        String ip = request.getRemoteAddr();

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("id", username);
        response.put("ip", ip);
        response.put("oauth", oauth);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/users/logout")
    public ApiResponse<?> logout(@RequestBody(required = false) Map<String, Object> body,
                                 @RequestHeader(value = "Authorization", required = false) String authorization,
                                 HttpServletRequest request) {
        try {
            // 1) 요청 바디/토큰에서 username 추출
            String username = extractUsername(body, authorization);

            if (username == null || username.isBlank()) {
                return ApiResponse.error("요청 정보가 잘못되었습니다.", 400, null);
            }

            // 2) 사용자 조회
            User user = userRepository.getUser(username);
            if (user == null) {
                return ApiResponse.error("사용자를 찾을 수 없습니다.", 404, null);
            }

            // 3) 마지막 로그인 이력 1건 조회
            List<History> list = historyRepository.findLatestHistory(user, PageRequest.of(0, 1));
            if (list.isEmpty()) {
                return ApiResponse.error("로그인 이력이 없습니다.", 404, null);
            }

            // 4) 로그아웃 시간 세팅(문자열 컬럼이므로 포맷 맞춰서)
            History latest = list.get(0);
            HistoryDTO dto = HistoryDTO.fromEntity(latest);
            String now = LocalDateTime.now().format(DT);
            dto.setLogout(now);

            // 5) merge 업데이트 (id 포함된 엔티티 save)
            historyRepository.save(dto.toEntity());

            Map<String, Object> data = Map.of(
                    "username", username,
                    "logoutAt", now
            );
            return ApiResponse.success(data);

        } catch (Exception e) {
            return ApiResponse.error("로그아웃 처리 중 오류가 발생했습니다.", 500, null);
        }
    }

    /** username 추출: body.username -> body.user.id -> JWT(claims.id) 순으로 시도 */
    private String extractUsername(Map<String, Object> body, String authorization) {
        // (1) body.username
        if (body != null && body.get("username") instanceof String u1 && !u1.isBlank()) {
            return u1;
        }
        // (2) body.user.id
        if (body != null && body.get("user") instanceof Map<?, ?> userMap) {
            Object idObj = userMap.get("id");
            if (idObj instanceof String u2 && !u2.isBlank()) {
                return u2;
            }
        }
        // (3) JWT 토큰 claims.id
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                String token = authorization.substring(7);
                Map<String, Object> claims = jwtUtil.validateToken(token);
                Object id = claims.get("id"); // 토큰에 id 클레임이 있을 때만 사용
                if (id instanceof String u3 && !u3.isBlank()) {
                    return u3;
                }
            } catch (Exception ignored) {}
        }
        return null;
    }
}
