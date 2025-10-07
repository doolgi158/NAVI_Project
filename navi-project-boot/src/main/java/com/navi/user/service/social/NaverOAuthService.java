package com.navi.user.service.social;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.navi.user.dto.SocialDTO;
import com.navi.user.enums.SocialState;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NaverOAuthService {

    @Value("${oauth.naver.client-id}")
    private String clientId;

    @Value("${oauth.naver.client-secret}")
    private String clientSecret;

    @Value("${oauth.naver.redirect-uri}")
    private String redirectUri;

    @Value("${oauth.naver.token-uri}")
    private String tokenUri;

    @Value("${oauth.naver.userinfo-uri}")
    private String userInfoUri;

    public SocialDTO getTokenInfo(String code) {
        RestTemplate restTemplate = new RestTemplate();

        // 🔹 1️⃣ access_token 발급 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, String> params = new LinkedHashMap<>();
        params.put("grant_type", "authorization_code");
        params.put("client_id", clientId);
        params.put("client_secret", clientSecret);
        params.put("redirect_uri", redirectUri);
        params.put("code", code);
        params.put("state", "naviState"); // 네이버는 필수 파라미터

        HttpEntity<Map<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(tokenUri, request, String.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Naver OAuth Token 요청 실패: " + response.getBody());
        }

        JsonObject jsonObj = JsonParser.parseString(response.getBody()).getAsJsonObject();
        String accessToken = jsonObj.get("access_token").getAsString();
        String refreshToken = jsonObj.has("refresh_token") ? jsonObj.get("refresh_token").getAsString() : null;
        int expiresIn = jsonObj.has("expires_in") ? jsonObj.get("expires_in").getAsInt() : 3600;

        // 🔹 2️⃣ 요청 및 만료 시간
        LocalDateTime requestTime = LocalDateTime.now();
        LocalDateTime limitTime = requestTime.plusSeconds(expiresIn);

        // 🔹 3️⃣ 사용자 정보 요청
        HttpHeaders userHeader = new HttpHeaders();
        userHeader.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> userEntity = new HttpEntity<>(userHeader);

        ResponseEntity<String> userInfoRes = restTemplate.exchange(userInfoUri, HttpMethod.GET, userEntity, String.class);
        JsonObject userJson = JsonParser.parseString(userInfoRes.getBody()).getAsJsonObject();

        System.out.println("✅ Naver User Info: " + userJson);

        // 🔹 4️⃣ SocialDTO 생성
        return SocialDTO.builder()
                .token(accessToken)
                .refresh(refreshToken)
                .confirm('T')
                .type(SocialState.NAVER)
                .request(requestTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .limit(limitTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}