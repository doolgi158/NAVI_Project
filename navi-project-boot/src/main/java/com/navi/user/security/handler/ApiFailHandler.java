package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.common.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;

public class ApiFailHandler implements AuthenticationFailureHandler {

    // 로그인 실패하면 Json 방식으로 알려주기
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String username = request.getParameter("username");

        ApiResponse<Object> apiResponse = ApiResponse.error(
                "로그인 실패",
                401,
                "id: " + username
        );

        Gson gson = new Gson();
        String str = gson.toJson(apiResponse);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(str);
        printWriter.close();
    }
}
