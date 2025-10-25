package com.navi.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.common.response.ApiResponse;
import com.navi.security.util.JWTUtil;
import com.navi.user.dto.auth.JWTClaimDTO;
import com.navi.user.dto.auth.UserSecurityDTO;
import com.navi.user.enums.UserState;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JWTCheckFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 인증 제외 경로
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/api/users/login",
            "/api/users/logout",
            "/api/users/signup",
            "/api/users/refresh",
            "/api/auth/oauth",
            "/api/login-try/"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String header = request.getHeader("Authorization");

        // 토큰이 없거나 Bearer 형식이 아닐 때 그냥 통과
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = header.substring(7);

            // JWT 파싱 및 유효성 검사
            JWTClaimDTO claim = jwtUtil.validateAndParse(token);
            if (claim == null || claim.getId() == null) {
                throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
            }

            UserState state = claim.getState() != null ? claim.getState() : UserState.NORMAL;

            // 휴면/탈퇴 계정 차단 처리
            if (state == UserState.SLEEP || state == UserState.DELETE) {
                handleBlockedUser(response, state);
                return;
            }

            // 권한 변환 및 SecurityContext 등록
            List<SimpleGrantedAuthority> authorities = claim.getRole().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .toList();

            // SecurityContext 등록
            UserSecurityDTO principal = new UserSecurityDTO(
                    claim.getId(), "N/A", authorities,
                    claim.getNo(), claim.getName(), claim.getEmail(),
                    claim.getState(), claim.getRole()
            );

            // SecurityContext 등록
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(principal, null, authorities)
            );

        } catch (ExpiredJwtException ex) {
            // 토큰 만료 처리
            writeJsonResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    ApiResponse.error("ACCESS_TOKEN_EXPIRED", HttpServletResponse.SC_UNAUTHORIZED, null));
            return;
        } catch (Exception e) {
            // 토큰 오류 처리
            writeJsonResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                    ApiResponse.error("잘못되거나 만료된 토큰입니다.", HttpServletResponse.SC_UNAUTHORIZED, null));
            return;
        }

        filterChain.doFilter(request, response);
    }

    // OPTIONS 요청 또는 인증 제외 경로는 필터 패스
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String path = request.getRequestURI();
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    // 휴면 / 탈퇴 계정 응답 처리
    private void handleBlockedUser(HttpServletResponse response, UserState state) throws IOException {
        ApiResponse<Object> blockedResponse = switch (state) {
            case SLEEP -> ApiResponse.error("휴면계정입니다. 정상 계정으로 전환하시겠습니까?", 403, "sleep");
            case DELETE -> ApiResponse.error("탈퇴한 계정입니다.", 403, "delete");
            default -> null;
        };
        if (blockedResponse != null) {
            writeJsonResponse(response, HttpServletResponse.SC_FORBIDDEN, blockedResponse);
        }
    }

    // JSON 응답 헬퍼
    private void writeJsonResponse(HttpServletResponse response, int status, ApiResponse<?> body) throws IOException {
        response.setContentType("application/json; charset=UTF-8");
        response.setStatus(status);
        objectMapper.findAndRegisterModules();
        objectMapper.writeValue(response.getWriter(), body);
    }
}