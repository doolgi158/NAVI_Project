package com.navi.user.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.navi.common.response.ApiResponse;
import com.navi.user.dto.JWTClaimDTO;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.enums.UserState;
import com.navi.user.security.util.JWTUtil;
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
import java.io.PrintWriter;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JWTCheckFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // ✅ 토큰이 없거나 Bearer 형식이 아닐 때 그냥 통과
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // ✅ JWT 검증 제외 경로
        if (path.equals("/api/users/login")
                || path.startsWith("/api/auth/oauth/")
                || path.equals("/api/users/refresh")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = header.substring(7);
            JWTClaimDTO claim = jwtUtil.validateAndParse(token);

            if (claim == null || claim.getId() == null) {
                throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
            }

            UserState state = claim.getState() != null ? claim.getState() : UserState.NORMAL;

            // ✅ 휴면/탈퇴 계정 차단 처리
            ApiResponse<Object> blockedResponse = null;
            if (state == UserState.SLEEP) {
                blockedResponse = ApiResponse.error("휴면계정입니다. 정상 계정으로 전환하시겠습니까?", 403, "sleep");
            } else if (state == UserState.DELETE) {
                blockedResponse = ApiResponse.error("탈퇴한 계정입니다.", 403, "delete");
            }

            if (blockedResponse != null) {
                response.setContentType("application/json; charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                objectMapper.findAndRegisterModules();
                objectMapper.writeValue(response.getWriter(), blockedResponse);
                return;
            }

            // ✅ 권한 변환
            List<SimpleGrantedAuthority> authorities = claim.getRole().stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .toList();

            // ✅ SecurityContext 등록
            UserSecurityDTO principal = new UserSecurityDTO(
                    claim.getName(),
                    claim.getPhone(),
                    claim.getBirth(),
                    claim.getEmail(),
                    claim.getId(),
                    "N/A",
                    state,
                    claim.getRole()
            );

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(auth);
            log.info("[JWT FILTER] Authenticated principal: {}", claim.getId());

        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            // ✅ 토큰 만료
            log.warn("[JWT FILTER] Access token expired");
            ApiResponse<Object> expired = ApiResponse.error("ACCESS_TOKEN_EXPIRED", HttpServletResponse.SC_UNAUTHORIZED, null);
            response.setContentType("application/json; charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            objectMapper.findAndRegisterModules();
            objectMapper.writeValue(response.getWriter(), expired);
            return;
        } catch (Exception e) {
            // ✅ 토큰 유효하지 않거나 오류 발생 시
            log.warn("[JWT FILTER] Invalid token: {}", e.getMessage());
            ApiResponse<Object> error = ApiResponse.error("잘못되거나 만료된 토큰입니다.", 401, null);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json; charset=UTF-8");
            PrintWriter writer = response.getWriter();
            objectMapper.findAndRegisterModules();
            objectMapper.writeValue(writer, error);
            writer.flush();
            writer.close();
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();

        // ✅ 인증 제외 경로들
        return path.startsWith("/api/users/signup")
                || path.startsWith("/api/users/login")
                || path.startsWith("/api/users/logout")
                || path.startsWith("/api/users/refresh")
                || path.startsWith("/api/auth/oauth")
                || path.startsWith("/api/transports")
                || path.startsWith("/api/accommodations")
                || path.startsWith("/api/posts")
                || path.startsWith("/api/notices")
                || path.startsWith("/api/login-try/")
                || path.startsWith("/api/flight")
                || path.startsWith("/api/delivery")
                || path.startsWith("/api/seats");
    }
}