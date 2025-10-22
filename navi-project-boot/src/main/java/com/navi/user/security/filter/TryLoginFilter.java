package com.navi.user.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.common.response.ApiResponse;
import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;

import static com.navi.user.security.util.LoginRequestUtil.getClientIp;
import static com.navi.user.security.util.LoginRequestUtil.getUserName;

@RequiredArgsConstructor
public class TryLoginFilter extends OncePerRequestFilter {
    private final TryLoginRepository tryLoginRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (!uri.equals("/api/users/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);
        String username = getUserName(request);

        // 로그인 차단 여부 확인 (IP 기반)
        if (username != null && tryLoginRepository.isLoginLocked(ip, username)) {
            ApiResponse<Object> apiResponse = ApiResponse.error(
                    "해당 계정(" + username + ")은 5회 이상 로그인 실패로 10분간 차단되었습니다.",
                    403,
                    ip + " / " + username
            );
            writeJsonResponse(response, apiResponse, HttpServletResponse.SC_FORBIDDEN);
            return;
        }


        // 계정 상태 확인
        if (username != null && !username.isBlank()) {
            User user = userRepository.getUser(username);

            if (user != null) {
                if (user.getUserState() == UserState.SLEEP) {
                    ApiResponse<Object> apiResponse = ApiResponse.error(
                            "휴면계정입니다. 정상 계정으로 전환하시겠습니까?",
                            403,
                            "sleep"
                    );
                    writeJsonResponse(response, apiResponse, HttpServletResponse.SC_FORBIDDEN);
                    return;
                }

                if (user.getUserState() == UserState.DELETE) {
                    ApiResponse<Object> apiResponse = ApiResponse.error(
                            "탈퇴한 계정입니다.",
                            403,
                            "delete"
                    );
                    writeJsonResponse(response, apiResponse, HttpServletResponse.SC_FORBIDDEN);
                    return;
                }
            }

            // 위 조건 모두 통과 시 로그인 진행
            filterChain.doFilter(request, response);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return !request.getRequestURI().equals("/api/users/login");
    }

    private void writeJsonResponse(HttpServletResponse response, ApiResponse<Object> body, int status) throws IOException {
        response.setContentType("application/json; charset=UTF-8");
        response.setStatus(status);
        try (PrintWriter writer = response.getWriter()) {
            objectMapper.findAndRegisterModules();
            objectMapper.writeValue(writer, body);
        }
    }
}