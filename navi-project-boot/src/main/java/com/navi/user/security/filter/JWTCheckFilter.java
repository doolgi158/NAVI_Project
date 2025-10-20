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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RequiredArgsConstructor
public class JWTCheckFilter extends OncePerRequestFilter {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

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
                // ✅ [수정1] JWT 문자열 추출 로직 유지
                String accessToken = authHeader.substring(7);

                // ✅ [수정2] JWT 유효성 검증 및 Claim 파싱
                JWTClaimDTO claim = jwtUtil.validateAndParse(accessToken);

                UserState state = claim.getState() != null ? claim.getState() : UserState.NORMAL;

                // 휴면 상태면 차단
                ApiResponse<Object> blockedResponse = null;

                if (state == UserState.SLEEP) {
                    blockedResponse = ApiResponse.error("휴면계정입니다. 정상 계정으로 전환하시겠습니까?", 403, "sleep");
                }
                if (state == UserState.DELETE) {
                    blockedResponse = ApiResponse.error("탈퇴한 계정입니다.", 403, "delete");
                }

                if (blockedResponse != null) {
                    response.setContentType("application/json; charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    objectMapper.findAndRegisterModules();
                    objectMapper.writeValue(response.getWriter(), blockedResponse);
                    return;
                }

                // ✅ [수정3] claim 검증 추가 (null 방지)
                if (claim == null || claim.getId() == null) {
                    throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
                }

                // ✅ [수정4] JWT에서 사용자 ID 추출
                String userId = claim.getId();

                // ✅ [수정5] 권한값 추출 시 ROLE_ prefix 추가
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

                // ✅ [수정6] SecurityContext에 인증 객체 등록 시 권한 포함
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userSecurityDTO, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (io.jsonwebtoken.ExpiredJwtException ex) {
                // 액세스 토큰 만료 (refresh 트리거)
                ApiResponse<Object> expiredResponse =
                        ApiResponse.error("ACCESS_TOKEN_EXPIRED", HttpServletResponse.SC_UNAUTHORIZED, null);

                response.setContentType("application/json; charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                objectMapper.findAndRegisterModules();
                objectMapper.writeValue(response.getWriter(), expiredResponse);
                return;
            } catch (Exception e) {
                // JWT 오류 응답
                Gson gson = new Gson();
                ApiResponse<Object> apiResponse = ApiResponse.error("잘못되거나 만료된 토큰입니다.", 401, null);

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // ✅ [수정7] HTTP 상태 명시적으로 설정
                response.setContentType("application/json; charset=UTF-8");

                PrintWriter writer = response.getWriter();
                objectMapper.findAndRegisterModules(); // LocalDateTime 직렬화 지원
                objectMapper.writeValue(writer, apiResponse);
                writer.flush();
                writer.close();
                return;
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
                || path.startsWith("/api/delivery");
    }
}
