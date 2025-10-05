package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.security.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

public class ApiSuccessHandler implements AuthenticationSuccessHandler {

    // 로그인 성공하면 토큰값 추가하여 json방식으로 알려주기
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        UserSecurityDTO userSecurityDTO = (UserSecurityDTO) authentication.getPrincipal();
        Map<String, Object> claims = userSecurityDTO.getClaims();

        String accessToken = JWTUtil.generateToken(claims, 10);
        String refreshToken = JWTUtil.generateToken(claims, 60 * 24);

        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        Gson gson = new Gson();
        String jsonStr = gson.toJson(claims);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
