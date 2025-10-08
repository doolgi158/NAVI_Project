package com.navi.user.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.HistoryDTO;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApiLogoutSuccessHandler implements LogoutSuccessHandler {
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        response.setContentType("application/json; charset=UTF-8");

        // React에서 보낸 JSON 데이터 읽기
        String body = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        String usernameFromBody = null;

        if (body != null && !body.isBlank()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> json = mapper.readValue(
                        body, new TypeReference<Map<String, Object>>() {}
                );
                usernameFromBody = (String) json.get("username");
            } catch (Exception ignored) {}
        }

        // 인증 객체에서 사용자 이름 추출
        String username = (authentication != null) ? authentication.getName() : usernameFromBody;
        if (username == null) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\":\"로그아웃 성공 (익명 사용자)\"}");
            return;
        }

        // 유저 찾기
        User user = userRepository.getUser(username);
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().write("{\"message\":\"사용자를 찾을 수 없습니다.\"}");
            return;
        }

        // 최신 로그인 이력 찾기
        List<History> list = historyRepository.findLatestHistory(user, PageRequest.of(0, 1));

        if (!list.isEmpty()) {
            History latest = list.get(0);
            HistoryDTO dto = HistoryDTO.fromEntity(latest);
            dto.setLogout(LocalDateTime.now().format(DT));
            historyRepository.save(dto.toEntity());
        }

        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("{\"message\":\"로그아웃 성공\"}");
    }
}
