package com.navi.security.handler;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializer;
import com.navi.common.response.ApiResponse;
import com.navi.user.repository.TryLoginRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static com.navi.security.util.LoginRequestUtil.getClientIp;
import static com.navi.security.util.LoginRequestUtil.getUserName;

@RequiredArgsConstructor
public class ApiFailHandler implements AuthenticationFailureHandler {
    private final TryLoginRepository tryLoginRepository;
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, (JsonSerializer<LocalDateTime>)
                    (src, typeOfSrc, context) -> new JsonPrimitive(src.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))))
            .create();


    // 로그인 실패하면 Json 방식으로 알려주기
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        String username = getUserName(request);
        String ip = getClientIp(request);

        // 실패 기록 저장
        tryLoginRepository.recordLoginAttempt(ip, username, false);

        ApiResponse<Object> apiResponse = ApiResponse.error("로그인 실패", 401, username);

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().println(gson.toJson(apiResponse));
    }
}
