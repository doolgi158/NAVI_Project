package com.navi.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.admin.user.repository.HistoryRepository;
import com.navi.common.response.ApiResponse;
import com.navi.security.util.JWTUtil;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.auth.JWTClaimDTO;
import com.navi.user.dto.auth.UserSecurityDTO;
import com.navi.user.dto.response.LoginResponseDTO;
import com.navi.user.dto.response.UserResponseDTO;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.repository.UserRepository;
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

import static com.navi.security.util.LoginRequestUtil.getClientIp;
import static com.navi.security.util.LoginRequestUtil.getUserName;

@RequiredArgsConstructor
@Slf4j
public class ApiSuccessHandler implements AuthenticationSuccessHandler {
    private final TryLoginRepository tryLoginRepository;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 로그인 성공하면 토큰값 추가하여 json방식으로 알려주기
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 인증된 사용자 정보
        UserSecurityDTO userSecurity = (UserSecurityDTO) authentication.getPrincipal();
        String username = getUserName(request);
        String ip = getClientIp(request);
        User user = userRepository.getUser(username);

        // JWTClaimDTO 생성
        JWTClaimDTO claim = JWTClaimDTO.fromUser(user);

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateToken(claim, 60 * 24);
        String refreshToken = jwtUtil.generateToken(claim, 60 * 24);

        // Claim 보강
        claim.setAccessToken(accessToken);
        claim.setRefreshToken(refreshToken);
        claim.setIp(ip);

        // 유저 정보 DTO 생성
        UserResponseDTO userResponse = UserResponseDTO.from(user);
        userResponse.setToken(accessToken); // 선택적으로 현재 액세스 토큰 포함

        // 응답 데이터 구성
        LoginResponseDTO loginResponse = LoginResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponseDTO.from(user))
                .build();

        // 로그인 히스토리 저장 (관리자 제외)
        if (user == null || user.getNo() == 0) {
            tryLoginRepository.recordLoginAttempt(ip, username, true);
            writeResponse(response, ApiResponse.success(loginResponse));
            return;
        }

        historyRepository.save(History.builder()
                .user(user)
                .ip(ip)
                .login(LocalDateTime.now())
                .build());

        tryLoginRepository.recordLoginAttempt(ip, username, true);
        writeResponse(response, ApiResponse.success(loginResponse));
    }

    // 공통 응답 메서드
    private void writeResponse(HttpServletResponse response, ApiResponse<?> apiResponse) throws IOException {

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json; charset=UTF-8");

        try (PrintWriter writer = response.getWriter()) {
            objectMapper.findAndRegisterModules();
            objectMapper.writeValue(writer, apiResponse);
        }
    }
}
