package com.navi.user.controller;

import com.navi.admin.user.repository.HistoryRepository;
import com.navi.common.response.ApiResponse;
import com.navi.security.util.JWTUtil;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.SocialDTO;
import com.navi.user.dto.auth.JWTClaimDTO;
import com.navi.user.dto.log.HistoryDTO;
import com.navi.user.enums.SocialState;
import com.navi.user.mapper.HistoryMapper;
import com.navi.user.repository.UserRepository;
import com.navi.user.service.social.SocialLoginService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/oauth")
public class ApiSocialController {
    private final SocialLoginService socialLoginService;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final HistoryMapper historyMapper;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/{provider}")
    public ApiResponse<?> oauthLogin(@PathVariable String provider, @RequestParam String code, HttpServletRequest request) {
        SocialState providerType = switch (provider.toLowerCase()) {
            case "google" -> SocialState.google;
            case "kakao" -> SocialState.kakao;
            case "naver" -> SocialState.naver;
            default -> throw new IllegalArgumentException("지원하지 않는 소셜 타입: " + provider);
        };

        SocialDTO social = socialLoginService.socialLogin(providerType, code);
        String ip = request.getRemoteAddr();
        String username = providerType.name().toLowerCase() + "_user";

        // JWT 발급
        Map<String, Object> claims = Map.of("id", username, "provider", providerType.name());
        String accessToken = jwtUtil.generateToken(claims, 10);
        String refreshToken = jwtUtil.generateToken(claims, 60 * 24);

        Map<String, Object> data = Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "userId", username,
                "ip", ip,
                "oauth", social
        );

        return ApiResponse.success(data);
    }

    @PostMapping("/api/users/logout")
    public ApiResponse<?> logout(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest request
    ) {
        try {
            String username = extractUsername(body, authorization);
            if (username == null || username.isBlank()) {
                return ApiResponse.error("요청 정보가 잘못되었습니다.", 400, null);
            }

            User user = userRepository.getUser(username);
            if (user == null) {
                return ApiResponse.error("사용자를 찾을 수 없습니다.", 404, null);
            }

            List<History> list = historyRepository.findLatestHistory(user, PageRequest.of(0, 1));
            if (list.isEmpty()) {
                return ApiResponse.error("로그인 이력이 없습니다.", 404, null);
            }

            History latest = list.get(0);
            LocalDateTime now = LocalDateTime.now();

            // DTO 경유해서 업데이트하는 현재 방식 유지 (ID 유지 필수)
            HistoryDTO dto = historyMapper.toDto(latest);
            dto.setLogout(now);

            History updated = historyMapper.toEntity(dto);
            updated = updated.toBuilder().user(user).no(latest.getNo()).build();

            historyRepository.save(updated);

            Map<String, Object> data = Map.of(
                    "username", username,
                    "logoutAt", now
            );

            return ApiResponse.success(data);

        } catch (Exception e) {
            return ApiResponse.error("로그아웃 처리 중 오류가 발생했습니다.", 500, null);
        }
    }

    /**
     * username 추출: body.username -> body.user.id -> JWT(claims.id) 순으로 시도
     */
    private String extractUsername(Map<String, Object> body, String authorization) {
        if (body != null) {
            Object u1 = body.get("username");
            if (u1 instanceof String && !((String) u1).isBlank()) return (String) u1;

            Object userObj = body.get("user");
            if (userObj instanceof Map<?, ?> userMap) {
                Object idObj = userMap.get("id");
                if (idObj instanceof String && !((String) idObj).isBlank()) return (String) idObj;
            }
        }

        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                String token = authorization.substring(7);
                JWTClaimDTO claims = jwtUtil.validateAndParse(token);
                String id = claims.getId();
                if (id != null && !id.isBlank()) return id;
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}