package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.user.dto.SocialDTO;
import com.navi.user.enums.SocialState;
import com.navi.user.security.util.JWTUtil;
import com.navi.user.service.social.SocialLoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SocialController {
    private final SocialLoginService socialLoginService;
    private final JWTUtil jwtUtil;

    @GetMapping("/oauth/{provider}")
    public ApiResponse<?> oauthLogin(@PathVariable SocialState provider,
                                     @RequestParam String code) {
        SocialDTO oauth = socialLoginService.socialLogin(provider, code);

        // 앱용 JWT (리소스 토큰과 별개)
        String accessToken  = jwtUtil.generateToken(
                Map.of("provider", oauth.getType().name(), "socialNo", oauth.getNo()), 10);
        String refreshToken = jwtUtil.generateToken(
                Map.of("provider", oauth.getType().name(), "socialNo", oauth.getNo(), "type", "refresh"), 60 * 24);

        return ApiResponse.success(Map.of(
                "oauth", oauth,                 // 소셜(리소스) 토큰/시간
                "accessToken", accessToken,     // 우리 서비스용 JWT
                "refreshToken", refreshToken
        ));
    }
}
