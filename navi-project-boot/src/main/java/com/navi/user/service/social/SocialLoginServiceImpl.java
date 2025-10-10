package com.navi.user.service.social;

import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.SocialDTO;
import com.navi.user.dto.users.UserDTO;
import com.navi.user.enums.SocialState;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.SocialRepository;
import com.navi.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SocialLoginServiceImpl implements SocialLoginService {
    private final GoogleOAuthService googleOAuthService;
    private final KakaoOAuthService kakaoOAuthService;
    private final NaverOAuthService naverOAuthService;
    private final SocialRepository socialRepository;
    private final UserRepository userRepository;
    private final HttpServletRequest request;
    private final PasswordEncoder passwordEncoder;
    private final HistoryRepository historyRepository;

    private static final DateTimeFormatter DT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Transactional
    public SocialDTO socialLogin(SocialState provider, String code) {
        // 프로바이더별 토큰/시간 정보 획득 (SocialDTO 반환)
        SocialDTO dto = switch (provider) {
            case google -> googleOAuthService.getTokenInfo(code);
            case kakao  -> kakaoOAuthService.getTokenInfo(code);
            case naver  -> naverOAuthService.getTokenInfo(code);
        };

        // 클라이언트 IP 추출
        String clientIp = getClientIp();

        // 사용자 이름 추출
        String username = provider.name().toLowerCase() + "_user";

        // 유저 존재 확인 및 등록 (id 기준)
        User user = userRepository.getUser(username);

        if (user == null) {
            UserDTO newUserDTO = new UserDTO(
                    provider.name(),
                    "010-0000-0000",
                    "2000.01.01",
                    provider.name() + "@social.com",
                    username,
                    passwordEncoder.encode("SOCIAL_" + UUID.randomUUID()),
                    UserState.NORMAL,
                    List.of("USER")
            );

            User newUser = newUserDTO.toEntity();
            newUser.addRole(UserRole.USER);

            user = userRepository.saveAndFlush(newUser); // 즉시 flush (social 저장 시 FK 보장)
        }

        // 로그인 이력은 항상 insert
        History history = History.builder()
                .ip(clientIp)
                .login(LocalDateTime.now().format(DT))
                .user(user)
                .build();

        historyRepository.save(history);

        // DB 저장 (리소스 토큰 그대로 저장, JWT로 덮어쓰지 않음)
        var existing = socialRepository.findByUser(user);

        if (existing.isPresent()) {
            // ✅ 기존 social → DTO 갱신 후 Entity 변환
            SocialDTO updatedDto = SocialDTO.builder()
                    .no(existing.get().getNo())
                    .token(dto.getToken())
                    .refresh(dto.getRefresh())
                    .confirm(dto.getConfirm())
                    .type(dto.getType())
                    .request(dto.getRequest())
                    .limit(dto.getLimit())
                    .build();

            socialRepository.save(updatedDto.toEntity(user)); // UPDATE
        } else {
            // ✅ 신규 사용자 → DTO → Entity 변환 후 저장
            socialRepository.save(dto.toEntity(user)); // INSERT
        }
        // 저장 후 DTO로 변환해 반환 (no 포함)
        return dto;
    }

    private String getClientIp() {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}