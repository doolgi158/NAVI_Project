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

import static com.navi.user.security.util.LoginRequestUtil.getClientIp;
import static com.navi.user.security.util.LoginRequestUtil.getUserName;

@RequiredArgsConstructor
public class ApiFailHandler implements AuthenticationFailureHandler {
    private final TryLoginRepository tryLoginRepository;

    // 로그인 실패하면 Json 방식으로 알려주기
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String username = getUserName(request);
        String ip = getClientIp(request);

        // 실패 기록 저장
        tryLoginRepository.recordLoginAttempt(ip, username, false);

        ApiResponse<Object> apiResponse = ApiResponse.error(
            "로그인 실패",
                401,
                "id: " + username
        );

        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().println(new Gson().toJson(apiResponse));
    }
}
