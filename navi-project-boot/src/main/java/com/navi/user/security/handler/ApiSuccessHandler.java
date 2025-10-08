package com.navi.user.security.handler;

import com.google.gson.Gson;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import static com.navi.user.security.util.LoginRequestUtil.getClientIp;
import static com.navi.user.security.util.LoginRequestUtil.getUserName;

@RequiredArgsConstructor
public class ApiSuccessHandler implements AuthenticationSuccessHandler {
    private final TryLoginRepository tryLoginRepository;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // 로그인 성공하면 토큰값 추가하여 json방식으로 알려주기
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        UserSecurityDTO userSecurityDTO = (UserSecurityDTO) authentication.getPrincipal();
        Map<String, Object> claims = userSecurityDTO.getClaims();

        String accessToken = jwtUtil.generateToken(claims, 10);
        String refreshToken = jwtUtil.generateToken(claims, 60 * 24);

        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        // 로그인 성공 시 IP 시도 초기화
        String ip = getClientIp(request);
        String username = getUserName(request);

        // DB에서 실제 User 엔티티 조회
        User user = userRepository.getUser(userSecurityDTO.getUsername());
        if (user != null) {
            // ✅ 로그인 이력 저장
            History history = History.builder()
                    .ip(ip)
                    .login(LocalDateTime.now().format(DT))
                    .user(user)
                    .build();

            historyRepository.save(history);
        }

        tryLoginRepository.recordLoginAttempt(ip, username, true);

        Gson gson = new Gson();
        String jsonStr = gson.toJson(claims);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
