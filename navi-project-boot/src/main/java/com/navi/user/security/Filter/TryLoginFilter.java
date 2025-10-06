package com.navi.user.security.Filter;

import com.google.gson.Gson;
import com.navi.common.response.ApiResponse;
import com.navi.user.repository.TryLoginRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;

@RequiredArgsConstructor
public class TryLoginFilter extends OncePerRequestFilter {
    private final TryLoginRepository tryLoginRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();

        // 로그인 요청일 때만 검사
        if (uri.equals("/api/users/login")) {
            String ip = getIp(request);

            if (tryLoginRepository.isIpLocked(ip)) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        "해당 IP는 5회 이상 로그인 실패로 10분간 차단되었습니다.",
                        403,
                        ip
                );

                Gson gson = new Gson();
                String jsonStr = gson.toJson(apiResponse);

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json; charset=UTF-8");
                PrintWriter writer = response.getWriter();
                writer.println(jsonStr);
                writer.close();
                return; // 로그인 진행 차단
            }
        }

        // 다른 요청은 그대로 진행
        filterChain.doFilter(request, response);
    }
    private String getIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return !request.getRequestURI().equals("/api/users/login");
    }
}
