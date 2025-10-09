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

        // access_token 발급 요청
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        params.add("state", "naviState"); // 네이버는 필수 파라미터

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<String> response;
        try {
            response = restTemplate.postForEntity(tokenUri, request, String.class);
        } catch (HttpClientErrorException e) {
            System.out.println("❌ Naver Token Error: " + e.getResponseBodyAsString());
            throw e;
        }

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Naver OAuth Token 요청 실패: " + response.getBody());
        }

        JsonObject jsonObj = JsonParser.parseString(response.getBody()).getAsJsonObject();
        String accessToken = jsonObj.get("access_token").getAsString();
        String refreshToken = jsonObj.has("refresh_token") ? jsonObj.get("refresh_token").getAsString() : null;
        int expiresIn = jsonObj.has("expires_in") ? jsonObj.get("expires_in").getAsInt() : 3600;

        // 요청 및 만료 시간
        LocalDateTime requestTime = LocalDateTime.now();
        LocalDateTime limitTime = requestTime.plusSeconds(expiresIn);

        // 사용자 정보 요청
        HttpHeaders userHeader = new HttpHeaders();
        userHeader.add("Authorization", "Bearer " + accessToken);
        HttpEntity<String> userEntity = new HttpEntity<>(userHeader);

        ResponseEntity<String> userInfoRes = restTemplate.exchange(userInfoUri, HttpMethod.GET, userEntity, String.class);
        JsonObject userJson = JsonParser.parseString(userInfoRes.getBody()).getAsJsonObject();

        System.out.println("✅ naver User Info: " + userJson);

        // SocialDTO 생성
        return SocialDTO.builder()
                .token(accessToken)
                .refresh(refreshToken)
                .confirm('T')
                .type(SocialState.naver)
                .request(requestTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .limit(limitTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}