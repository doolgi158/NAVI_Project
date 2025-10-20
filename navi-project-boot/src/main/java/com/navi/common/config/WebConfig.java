package com.navi.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:file:///C:/navi-project/images/}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // React 개발 서버 주소에 대해 모든 경로 허용
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        // 날짜 포맷터 등록 (DateFormatter 클래스가 존재해야 함)
        registry.addFormatter(new DateFormatter());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 리소스 핸들링
        registry.addResourceHandler("/uploads/**", "/images/**")
                .addResourceLocations(uploadDir, "file:" + uploadDir + "/");
    }
}