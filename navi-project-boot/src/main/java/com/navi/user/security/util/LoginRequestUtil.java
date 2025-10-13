package com.navi.user.security.util;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.Map;

public class LoginRequestUtil {

    /**
     * 클라이언트 IP 추출
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * 로그인 요청에서 username 추출
     * - form-data, query string, header, JSON body 모두 지원
     */
    public static String getUserName(HttpServletRequest request) {
        // form-data or query string
        String username = request.getParameter("username");
        if (username != null && !username.isBlank()) {
            return username.trim();
        }

        // custom header
        username = request.getHeader("X-Username");
        if (username != null && !username.isBlank()) {
            return username.trim();
        }

        // JSON body (application/json)
        try {
            if ("application/json".equalsIgnoreCase(request.getContentType())) {
                String body = request.getReader().lines().reduce("", (acc, line) -> acc + line);
                if (body.contains("username")) {
                    Map<?, ?> jsonMap = new Gson().fromJson(body, Map.class);
                    Object value = jsonMap.get("username");
                    if (value != null) {
                        return value.toString().trim();
                    }
                }
            }
        } catch (IOException ignored) {}

        return null;
    }
}
