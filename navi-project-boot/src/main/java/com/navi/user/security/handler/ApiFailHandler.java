package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.common.response.ApiResponse;
import com.navi.user.repository.TryLoginRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;

@RequiredArgsConstructor
public class ApiFailHandler implements AuthenticationFailureHandler {
    private final TryLoginRepository tryLoginRepository;

    // 로그인 실패하면 Json 방식으로 알려주기
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String username = request.getParameter("username");
        String ip = getIp(request);

        // 실패 기록 저장
        tryLoginRepository.recordLoginAttempt(ip, false);

        ApiResponse<Object> apiResponse = ApiResponse.error(
            "로그인 실패",
                401,
                "id: " + username
        );

        Gson gson = new Gson();
        String str = gson.toJson(apiResponse);

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(str);
        printWriter.close();
    }

    private String getIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For 헤더에는 "client, proxy1, proxy2" 형태로 여러 IP가 들어올 수 있음
            return ip.split(",")[0].trim(); // 첫 번째 IP가 실제 클라이언트 IP
        }

        return request.getRemoteAddr();
    }
}
