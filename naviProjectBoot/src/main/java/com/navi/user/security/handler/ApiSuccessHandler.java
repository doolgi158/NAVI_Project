package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.user.dto.UserDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@Slf4j
public class ApiSuccessHandler implements AuthenticationSuccessHandler {
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        UserDTO userDTO = (UserDTO) authentication.getPrincipal();
        Map<String, Object> claims = userDTO.getClaims();

        claims.put("accessToken", "");
        claims.put("refreshToken", "");

        Gson gson = new Gson();
        String jsonStr = gson.toJson(claims);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
