package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.HistoryDTO;
import com.navi.user.dto.SocialDTO;
import com.navi.user.enums.SocialState;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.util.JWTUtil;
import com.navi.user.service.social.SocialLoginService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class ApiSocialController {

    private final SocialLoginService socialLoginService;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // 소셜 로그인: 응답을 ApiResponse로, enum 안전 변환
    @GetMapping("/api/auth/oauth/{provider}")
    public ApiResponse<?> oauthLogin(
            @PathVariable("provider") String providerStr,
            @RequestParam String code,
            HttpServletRequest request
    ) {
        // provider 소문자/대문자 모두 허용
        SocialState provider;
        try {
            provider = SocialState.valueOf(providerStr.toLowerCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("지원하지 않는 소셜 로그인 타입입니다: " + providerStr, 400, null);
        }

        SocialDTO oauth = socialLoginService.socialLogin(provider, code);

        // 앱용 JWT (간단 클레임)
        Map<String, Object> accessClaims = new HashMap<>();
        accessClaims.put("provider", oauth.getType() != null ? oauth.getType().name() : "UNKNOWN");
        accessClaims.put("socialNo", oauth.getNo());

        Map<String, Object> refreshClaims = new HashMap<>();
        refreshClaims.put("provider", oauth.getType() != null ? oauth.getType().name() : "UNKNOWN");
        refreshClaims.put("socialNo", oauth.getNo());
        refreshClaims.put("type", "refresh");

        String accessToken = jwtUtil.generateToken(accessClaims, 10);
        String refreshToken = jwtUtil.generateToken(refreshClaims, 60 * 24);

        // 부가 정보
        String username = provider.name().toLowerCase(Locale.ROOT) + "_user";
        String ip = request.getRemoteAddr();

        Map<String, Object> data = new HashMap<>();
        data.put("accessToken", accessToken);
        data.put("refreshToken", refreshToken);
        data.put("id", username);
        data.put("ip", ip);
        data.put("oauth", oauth);

        // 프런트가 기대하는 형태로 래핑
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
            String now = LocalDateTime.now().format(DT);

            // DTO 경유해서 업데이트하는 현재 방식 유지 (ID 유지 필수)
            HistoryDTO dto = HistoryDTO.fromEntity(latest);
            dto.setLogout(now);
            historyRepository.save(dto.toEntity());

            Map<String, Object> data = new HashMap<>();
            data.put("username", username);
            data.put("logoutAt", now);

            return ApiResponse.success(data);

        } catch (Exception e) {
            return ApiResponse.error("로그아웃 처리 중 오류가 발생했습니다.", 500, null);
        }
    }

    /** username 추출: body.username -> body.user.id -> JWT(claims.id) 순으로 시도 */
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
                Map<String, Object> claims = jwtUtil.validateToken(token);
                Object id = claims.get("id");
                if (id instanceof String && !((String) id).isBlank()) return (String) id;
            } catch (Exception ignored) {}
        }
        return null;
    }
}