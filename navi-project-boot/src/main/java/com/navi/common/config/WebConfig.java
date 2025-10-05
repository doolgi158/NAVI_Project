package com.navi.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class WebConfig {
    // WebMvcConfigurer 구현 대신 @Bean 메소드 사용

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ⚠️ React 개발 서버 포트만 허용하는 것이 보안상 더 좋습니다.
        // configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // 현재는 와일드카드(*)를 사용하여 모든 오리진을 허용합니다.
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        configuration.setAllowedMethods(Arrays.asList("POST", "GET", "DELETE", "PUT", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로("/**")에 대해 위에서 설정한 CORS 규칙을 적용합니다.
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
