package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.security.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@RequiredArgsConstructor
public class ApiSuccessHandler implements AuthenticationSuccessHandler {
    private final TryLoginRepository tryLoginRepository;

    // 로그인 성공하면 토큰값 추가하여 json방식으로 알려주기
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        UserSecurityDTO userSecurityDTO = (UserSecurityDTO) authentication.getPrincipal();
        Map<String, Object> claims = userSecurityDTO.getClaims();

        String accessToken = JWTUtil.generateToken(claims, 10);
        String refreshToken = JWTUtil.generateToken(claims, 60 * 24);

        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        // 로그인 성공 시 IP 시도 초기화
        String ip = getIp(request);
        tryLoginRepository.recordLoginAttempt(ip, true);

        Gson gson = new Gson();
        String jsonStr = gson.toJson(claims);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }

    private String getIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
