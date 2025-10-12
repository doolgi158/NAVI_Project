package com.navi.common.config.kakao;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * ============================================
 * [KakaoConfig]
 * : Kakao Local REST API 키 관리 설정 클래스
 * ============================================
 * ㄴ 서비스(KakaoGeoService 등)에서 사용할 수 있도록 제공
 */

@Getter
@Configuration
public class KakaoConfig {
    @Value("${kakao.api.key}")
    private String apiKey;
}
