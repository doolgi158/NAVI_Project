package com.navi.user.security.filter;

import com.google.gson.Gson;
import com.navi.common.response.ApiResponse;
import com.navi.user.dto.JWTClaimDTO;
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

                // ✅ [수정3] claim 검증 추가 (null 방지)
                if (claim == null || claim.getId() == null) {
                    throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
                }

                // ✅ [수정4] JWT에서 사용자 ID 추출
                String userId = claim.getId();

                // ✅ [수정5] 권한값 추출 시 ROLE_ prefix 추가
                String role = claim.getPrimaryRole();
                if (role == null) role = "USER"; // 기본값 지정
                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));

                // ✅ [수정6] SecurityContext에 인증 객체 등록 시 권한 포함
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(claim, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                // JWT 오류 응답
                Gson gson = new Gson();
                ApiResponse<Object> apiResponse = ApiResponse.error("잘못되거나 만료된 토큰입니다.", 401, null);

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // ✅ [수정7] HTTP 상태 명시적으로 설정
                response.setContentType("application/json; charset=UTF-8");

                PrintWriter printWriter = response.getWriter();
                printWriter.println(gson.toJson(apiResponse));
                printWriter.close();
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
                || path.startsWith("/api/auth/oauth") // ✅ [수정8] 슬래시 중복 및 패턴 통합
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
