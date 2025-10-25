package com.navi.security.util;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletRequest;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;


/**
 * 로그인 요청 정보 유틸리티
 * - 클라이언트 IP 및 username 추출을 위한 공용 유틸 클래스
 * - 다양한 요청 형태(form-data, header, JSON body)에 대응
 */
public class LoginRequestUtil {

    /**
     * 클라이언트 IP 추출
     * - X-Forwarded-For 우선 사용 (프록시, 로드밸런서 환경 고려)
     * - 없을 경우 getRemoteAddr()로 대체
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For가 여러 개면 첫 번째 IP 사용
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
        if (isValid(username)) return username;

        // custom header (X-Username)
        username = request.getHeader("X-Username");
        if (isValid(username)) return username;

        // JSON body (application/json or application/json;charset=UTF-8)
        try {
            String contentType = request.getContentType();
            if (contentType != null && contentType.toLowerCase().contains("application/json")) {
                try (BufferedReader reader = request.getReader()) {
                    String body = reader.lines().reduce("", (acc, line) -> acc + line);
                    if (body.contains("username")) {
                        Map<?, ?> jsonMap = new Gson().fromJson(body, Map.class);
                        Object value = jsonMap.get("username");
                        if (value != null) {
                            return value.toString().trim();
                        }
                    }
                }
            }
        } catch (IOException ignored) {
            // request body 읽기 실패 시 username은 null로 반환
        }

        // 모든 방식 실패 시 null 반환
        return null;
    }

    // 내부 유효성 검사 헬퍼
    private static boolean isValid(String value) {
        return value != null && !value.isBlank();
    }
}
