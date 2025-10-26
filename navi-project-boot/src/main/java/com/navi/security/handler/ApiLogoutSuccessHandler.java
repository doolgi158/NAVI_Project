package com.navi.security.handler;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.admin.user.repository.HistoryRepository;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApiLogoutSuccessHandler implements LogoutSuccessHandler {
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    @Transactional
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {
        response.setContentType("application/json; charset=UTF-8");

        // 인증 객체에서 사용자 이름 추출
        String username = null;
        try (var reader = request.getReader()) {
            String body = reader.lines().collect(Collectors.joining());
            if (!body.isBlank()) {
                Map<String, Object> json = mapper.readValue(body, new TypeReference<>() {
                });
                username = (String) json.get("username");
            }
        }

        if (authentication != null && username == null)
            username = authentication.getName();

        if (username == null) {
            response.getWriter().write("{\"message\":\"로그아웃 성공 (익명 사용자)\"}");
            return;
        }

        // 유저 찾기
        User user = userRepository.getUser(username);
        if (user == null) {
            response.getWriter().write("{\"message\":\"사용자를 찾을 수 없습니다.\"}");
            return;
        }

        // 관리자 예외 처리 (user_no == 0 인 경우)
        if (user.getNo() == 0) {
            response.getWriter().write("{\"message\":\"관리자 로그아웃 완료 (히스토리 생략)\"}");
            return;
        }

        // 최신 로그인 이력 조회
        historyRepository.findLatestHistory(user, PageRequest.of(0, 1))
                .stream().findFirst()
                .ifPresent(latest -> {
                    History updated = latest.toBuilder().logout(LocalDateTime.now()).build();
                    historyRepository.save(updated);
                });

        response.getWriter().write("{\"message\":\"로그아웃 성공\"}");
    }
}
