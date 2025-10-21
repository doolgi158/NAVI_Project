package com.navi.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // ✅ 이 주소가 현재 React 개발 서버 주소와 일치해야 합니다.
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addFormatter(new DateFormatter());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ 현재 실행 위치를 기준으로 상대경로 ../images 보정
        String imagePath = Paths.get(System.getProperty("user.dir"), "../images")
                .normalize()
                .toAbsolutePath()
                .toString()
                .replace("\\", "/");

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + imagePath + "/")
                .addResourceLocations("file:///C:/navi-project/images/");
    }
}