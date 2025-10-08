package com.navi.user.service.social;

import com.navi.user.domain.Social;
import com.navi.user.dto.SocialDTO;
import com.navi.user.enums.SocialState;
import com.navi.user.repository.SocialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SocialLoginServiceImpl implements SocialLoginService {

    private final GoogleOAuthService googleOAuthService;
    private final KakaoOAuthService kakaoOAuthService;
    private final NaverOAuthService naverOAuthService;
    private final SocialRepository socialRepository;

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

        // DB 저장 (리소스 토큰 그대로 저장, JWT로 덮어쓰지 않음)
        Social social = Social.builder()
                .token(dto.getToken())
                .refresh(dto.getRefresh())
                .confirm(dto.getConfirm() == 'T')
                .type(dto.getType())
                .request(LocalDateTime.parse(dto.getRequest(), DT))
                .limit(LocalDateTime.parse(dto.getLimit(), DT))
                .build();

        social = socialRepository.save(social); // PK 채워진 엔티티

        // 저장 후 DTO로 변환해 반환 (no 포함)
        return SocialDTO.fromEntity(social);
    }
}
