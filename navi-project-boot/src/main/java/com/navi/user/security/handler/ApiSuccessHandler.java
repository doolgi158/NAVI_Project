package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.admin.user.repository.HistoryRepository;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.JWTClaimDTO;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.Map;

import static com.navi.user.security.util.LoginRequestUtil.getClientIp;
import static com.navi.user.security.util.LoginRequestUtil.getUserName;

@RequiredArgsConstructor
@Slf4j
public class ApiSuccessHandler implements AuthenticationSuccessHandler {
    private final TryLoginRepository tryLoginRepository;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    // 로그인 성공하면 토큰값 추가하여 json방식으로 알려주기
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 인증된 사용자 정보
        UserSecurityDTO userSecurityDTO = (UserSecurityDTO) authentication.getPrincipal();
        String username = getUserName(request);
        String ip = getClientIp(request);

        // DB에서 사용자 조회
        User user = userRepository.getUser(username);

        // JWTClaimDTO 생성
        JWTClaimDTO claim = JWTClaimDTO.fromUser(user);

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateToken(claim, 60);
        String refreshToken = jwtUtil.generateToken(claim, 60);

        // 응답 데이터 구성
        claim.setAccessToken(accessToken);
        claim.setRefreshToken(refreshToken);

        // 로그인 히스토리 저장 (관리자 제외)
        if (user == null || user.getNo() == 0) {
            tryLoginRepository.recordLoginAttempt(ip, username, true);
            writeResponse(response, claim, "관리자 로그인 성공 (히스토리 제외)");
            return;
        }

        History history = History.builder()
                .user(user)
                .ip(ip)
                .login(LocalDateTime.now())
                .build();
        historyRepository.save(history);

        tryLoginRepository.recordLoginAttempt(ip, username, true);
        writeResponse(response, claim, "로그인 성공");
    }

    // 공통 응답 메서드
    private void writeResponse(HttpServletResponse response, Object body, String message) throws IOException {
        Gson gson = new Gson();

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json; charset=UTF-8");

        if (body instanceof JWTClaimDTO claim) {
            // null-safe 처리
            String id = claim.getId() != null ? claim.getId() : "unknown";
            String access = claim.getAccessToken() != null ? claim.getAccessToken() : "";
            String refresh = claim.getRefreshToken() != null ? claim.getRefreshToken() : "";
            String ip = claim.getIp() != null ? claim.getIp() : "0.0.0.0";

            Long userNo = 0L;
            if (userRepository.existsById(id)) {
                userNo = userRepository.getUser(id).getNo();
            }

            try (PrintWriter out = response.getWriter()) {
                out.println(gson.toJson(
                        Map.of(
                                "status", 200,
                                "message", message,
                                "id", id,
                                "username", id,
                                "roles", claim.getRole(),
                                "accessToken", access,
                                "refreshToken", refresh,
                                "ip", ip,
                                "userNo", userNo
                        )
                ));
                out.flush();
            }
        } else {
            try (PrintWriter out = response.getWriter()) {
                out.println(gson.toJson(
                        Map.of(
                                "status", 200,
                                "message", message,
                                "data", body != null ? body : "null"
                        )
                ));
                out.flush();
            }
        }
    }
}
