package com.navi.user.service.social;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.navi.user.dto.SocialDTO;
import com.navi.user.enums.SocialState;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * NAVI 통합 OAuth 서비스
 * - Google / Kakao / Naver 공통 로직 통합
 * - 개별 Provider URI 및 인증 파라미터는 프로퍼티 기반 주입
 */
@Service
@RequiredArgsConstructor
public class OAuthUnifiedService {

    private final RestTemplate restTemplate = new RestTemplate();

    // =====[ Google 설정 ]=====
    @Value("${oauth.google.client-id}")
    private String googleClientId;
    @Value("${oauth.google.client-secret}")
    private String googleClientSecret;
    @Value("${oauth.google.redirect-uri}")
    private String googleRedirectUri;
    @Value("${oauth.google.token-uri}")
    private String googleTokenUri;
    @Value("${oauth.google.userinfo-uri}")
    private String googleUserInfoUri;

    // =====[ Kakao 설정 ]=====
    @Value("${oauth.kakao.client-id}")
    private String kakaoClientId;
    @Value("${oauth.kakao.client-secret}")
    private String kakaoClientSecret;
    @Value("${oauth.kakao.redirect-uri}")
    private String kakaoRedirectUri;
    @Value("${oauth.kakao.token-uri}")
    private String kakaoTokenUri;
    @Value("${oauth.kakao.userinfo-uri}")
    private String kakaoUserInfoUri;

    // =====[ Naver 설정 ]=====
    @Value("${oauth.naver.client-id}")
    private String naverClientId;
    @Value("${oauth.naver.client-secret}")
    private String naverClientSecret;
    @Value("${oauth.naver.redirect-uri}")
    private String naverRedirectUri;
    @Value("${oauth.naver.token-uri}")
    private String naverTokenUri;
    @Value("${oauth.naver.userinfo-uri}")
    private String naverUserInfoUri;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // provider(code)에 맞는 토큰/유저정보 통합 처리
    public SocialDTO getTokenInfo(SocialState provider, String code) {
        switch (provider) {
            case google -> {
                return handleOAuth(provider,
                        googleClientId, googleClientSecret,
                        googleRedirectUri, googleTokenUri, googleUserInfoUri,
                        code, null);
            }
            case kakao -> {
                return handleOAuth(provider,
                        kakaoClientId, kakaoClientSecret,
                        kakaoRedirectUri, kakaoTokenUri, kakaoUserInfoUri,
                        code, null);
            }
            case naver -> {
                return handleOAuth(provider,
                        naverClientId, naverClientSecret,
                        naverRedirectUri, naverTokenUri, naverUserInfoUri,
                        code, "naviState");
            }
            default -> throw new IllegalArgumentException("지원하지 않는 provider: " + provider);
        }
    }

    // 공통 OAuth 처리 로직
    private SocialDTO handleOAuth(
            SocialState provider,
            String clientId,
            String clientSecret,
            String redirectUri,
            String tokenUri,
            String userInfoUri,
            String code,
            String state // 네이버만 사용
    ) {
        try {
            // AccessToken 요청
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("code", code);
            if (state != null) params.add("state", state);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUri, request, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException(provider.name() + " OAuth Token 요청 실패: " + response.getBody());
            }

            JsonObject tokenJson = JsonParser.parseString(response.getBody()).getAsJsonObject();
            String accessToken = tokenJson.get("access_token").getAsString();
            String refreshToken = tokenJson.has("refresh_token")
                    ? tokenJson.get("refresh_token").getAsString() : null;
            int expiresIn = tokenJson.has("expires_in")
                    ? tokenJson.get("expires_in").getAsInt() : 3600;

            // 사용자 정보 요청
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.add("Authorization", "Bearer " + accessToken);
            HttpEntity<String> userRequest = new HttpEntity<>(userHeaders);

            ResponseEntity<String> userInfoRes =
                    restTemplate.exchange(userInfoUri, HttpMethod.GET, userRequest, String.class);

            JsonObject userJson = JsonParser.parseString(userInfoRes.getBody()).getAsJsonObject();

            // DTO 생성 및 반환
            LocalDateTime now = LocalDateTime.now();
            return SocialDTO.builder()
                    .token(accessToken)
                    .refresh(refreshToken)
                    .confirm('T')
                    .type(provider)
                    .request(now.format(FORMATTER))
                    .limit(now.plusSeconds(expiresIn).format(FORMATTER))
                    .build();

        } catch (HttpClientErrorException e) {
            throw e;
        }
    }
}
