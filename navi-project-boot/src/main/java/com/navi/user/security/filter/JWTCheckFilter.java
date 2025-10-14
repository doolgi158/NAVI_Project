package com.navi.user.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
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
public class JWTCheckFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper(); // Jackson 사용

    public JWTCheckFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("[JWT FILTER] Start filtering request: {}", request.getRequestURI());
        log.info("[JWT FILTER] Header: {}", request.getHeader("Authorization"));

        String header = request.getHeader("Authorization");

        // 토큰이 없거나 Bearer 형식이 아닌 경우
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // 로그인 및 OAuth 요청은 JWT 검사 건너뛰기
        if (path.startsWith("/api/auth/oauth/") || path.equals("/api/users/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                // JWT 검증
                String accessToken = authHeader.substring(7);
                JWTClaimDTO claim = jwtUtil.validateAndParse(accessToken);

                List<SimpleGrantedAuthority> authorities = claim.getRole().stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                        .toList();

                // principal을 UserSecurityDTO로 생성
                UserSecurityDTO userSecurityDTO = new UserSecurityDTO(
                        claim.getName(),
                        claim.getPhone(),
                        claim.getBirth(),
                        claim.getEmail(),
                        claim.getId(),
                        "N/A", // 비밀번호는 JWT 기반 인증이므로 불필요
                        UserState.NORMAL, // JWT 안에 상태값이 있으면 claim에서 꺼내서 넣어도 됨
                        claim.getRole()
                );

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userSecurityDTO, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);
                log.info("[JWT FILTER] Authenticated principal: {}", userSecurityDTO.getId());

            } catch (Exception e) {
                // JWT 오류 응답 - Jackson 사용
                ApiResponse<Object> apiResponse = ApiResponse.error("잘못되거나 만료된 토큰입니다.", 401, null);

                response.setContentType("application/json; charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                PrintWriter writer = response.getWriter();
                objectMapper.findAndRegisterModules(); // LocalDateTime 직렬화 지원
                objectMapper.writeValue(writer, apiResponse);
                writer.flush();
                writer.close();
                return; // 필터 체인 중단
            }
        }
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // CORS 사전 요청 건너뜀
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();

        // 로그인 없이 접근 가능한 페이지 건너뜀
        return path.startsWith("/api/users/signup")
                || path.startsWith("/api/users/login")
                || path.startsWith("/api/travel")
                || path.startsWith("/api/transports")
                || path.startsWith("/api/accommodations")
                || path.startsWith("/api/posts")
                || path.startsWith("/api/notices")
                || path.startsWith("/api/login-try/")
                || path.startsWith("/api/users/logout")
                || path.startsWith("/api/flight")
                || path.startsWith("/api/delivery")
                || path.startsWith("/api/seats");
    }
}
