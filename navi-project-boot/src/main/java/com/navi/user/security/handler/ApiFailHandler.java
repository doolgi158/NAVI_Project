package com.navi.user.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@Slf4j
public class ApiFailHandler implements AuthenticationFailureHandler {

    // 로그인 실패하면 Json 방식으로 알려주기
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        Gson gson = new Gson();
        String str = gson.toJson(Map.of("error", "Login_Error"));
        response.setContentType("application/json");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(str);
        printWriter.close();
    }
}
