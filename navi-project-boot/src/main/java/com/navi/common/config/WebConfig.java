package com.navi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 이미지 정적 리소스 제공 설정
     * /images/** 경로로 들어오는 요청을 실제 파일 시스템의 이미지 폴더로 매핑
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Windows 경로 (개발 환경)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///C:/navi-project/images/")
                .setCachePeriod(3600); // 1시간 캐싱

        // Linux 서버 경로 (배포 환경) - 필요시 주석 해제
        /*
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:/var/www/navi-project/images/")
                .setCachePeriod(3600);
        */
    }

    /**
     * CORS 설정 (프론트엔드와 통신 허용)
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:5173",      // Vite 개발 서버
                        "http://localhost:3000",      // React 개발 서버
                        "https://yourdomain.com"      // 실제 배포 도메인 (배포 시 수정)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}