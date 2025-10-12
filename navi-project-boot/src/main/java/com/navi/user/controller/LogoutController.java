package com.navi.user.controller;

import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/logout")
@RequiredArgsConstructor
public class LogoutController {
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @PostMapping("/on-close")
    @Transactional
    public ResponseEntity<?> logoutOnClose(@RequestBody(required = false) Map<String, Object> payload) {
        String username = (payload != null) ? (String) payload.get("username") : null;
        if (username == null || username.isBlank()) {
            return ResponseEntity.ok(Map.of("message", "로그아웃 처리: 익명 사용자"));
        }

        User user = userRepository.getUser(username);
        if (user == null) {
            return ResponseEntity.ok(Map.of("message", "사용자 없음 (이미 로그아웃 상태로 간주)"));
        }

        List<History> list = historyRepository.findLatestHistory(user, PageRequest.of(0, 1));
        if (!list.isEmpty()) {
            History latest = list.get(0);
            latest = History.builder()
                    .no(latest.getNo())
                    .ip(latest.getIp())
                    .login(latest.getLogin())
                    .logout(LocalDateTime.now().format(DT))
                    .user(user)
                    .build();
            historyRepository.save(latest);
        }

        return ResponseEntity.ok(Map.of("message", "창 닫힘 로그아웃 완료"));
    }
}
