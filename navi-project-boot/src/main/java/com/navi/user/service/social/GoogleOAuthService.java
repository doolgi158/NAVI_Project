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
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {
    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    @Value("${oauth.google.token-uri}")
    private String tokenUri;

    @Value("${oauth.google.userinfo-uri}")
    private String userInfoUri;

    // 구글 인가 코드(code)로 액세스 토큰 발급 및 사용자 정보 조회
    public SocialDTO getTokenInfo(String code) {
        RestTemplate restTemplate = new RestTemplate();

        // 헤더 설정 (form 전송)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 요청 파라미터 구성
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri); // 반드시 콘솔 등록값과 동일 (예: http://localhost:5173/login/oauth2/redirect)
        params.add("grant_type", "authorization_code");

        // 요청 엔티티
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        // 토큰 요청
        ResponseEntity<String> response = restTemplate.postForEntity(tokenUri, params, String.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Google OAuth Token 요청 실패: " + response.getBody());
        }

        // JSON 파싱
        JsonObject jsonObj = JsonParser.parseString(response.getBody()).getAsJsonObject();
        String accessToken = jsonObj.get("access_token").getAsString();
        String refreshToken = jsonObj.has("refresh_token") ? jsonObj.get("refresh_token").getAsString() : null;
        int expiresIn = jsonObj.has("expires_in") ? jsonObj.get("expires_in").getAsInt() : 3600;

        // 요청 및 만료 시간 계산
        LocalDateTime requestTime = LocalDateTime.now();
        LocalDateTime limitTime = requestTime.plusSeconds(expiresIn);

        // 사용자 정보 조회
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> userRequest = new HttpEntity<>(userHeaders);

        ResponseEntity<String> userInfoRes = restTemplate.exchange(userInfoUri, HttpMethod.GET, userRequest, String.class);
        JsonObject userJson = JsonParser.parseString(userInfoRes.getBody()).getAsJsonObject();

        // 디버깅용 로그
        System.out.println("✅ Google User Info: " + userJson);

        // SocialDTO 생성 및 반환
        return SocialDTO.builder()
                .token(accessToken)
                .refresh(refreshToken)
                .confirm('T') // 성공 여부
                .type(SocialState.google)
                .request(requestTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .limit(limitTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}