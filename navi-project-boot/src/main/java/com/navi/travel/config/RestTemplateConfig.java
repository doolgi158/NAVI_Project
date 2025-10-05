package com.navi.travel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

/**
 * RestTemplate 설정을 위한 Configuration 클래스입니다.
 * 제주 API의 응답 Content-Type이 text/html로 잘못 지정되는 문제를 해결하기 위해
 * 해당 미디어 타입을 지원하도록 확장한 MessageConverter를 등록합니다.
 */
@Configuration
public class RestTemplateConfig {

    /**
     * MappingJackson2HttpMessageConverter를 확장하여 text/html 미디어 타입을 지원하도록 합니다.
     * 이는 제주 API가 JSON을 반환하면서도 Content-Type을 text/html로 설정하는 문제를 우회하기 위함입니다.
     */
    private static class HtmlToJsonMessageConverter extends MappingJackson2HttpMessageConverter {
        public HtmlToJsonMessageConverter() {
            setSupportedMediaTypes(Arrays.asList(
                    MediaType.APPLICATION_JSON,
                    MediaType.TEXT_HTML // API 문제 해결을 위해 text/html 추가
            ));
        }

        @Override
        public List<MediaType> getSupportedMediaTypes() {
            return Arrays.asList(
                    MediaType.APPLICATION_JSON,
                    MediaType.TEXT_HTML
            );
        }
    }

    /**
     * 애플리케이션에서 사용할 RestTemplate Bean을 등록하고 커스텀 MessageConverter를 적용합니다.
     * 이 Bean은 TravelServiceImpl에서 주입받아 사용됩니다.
     */
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // Spring Boot 기본 컨버터 중 하나인 MappingJackson2HttpMessageConverter를 제거하고,
        // 우리가 만든 HtmlToJsonMessageConverter로 대체합니다.
        restTemplate.getMessageConverters().removeIf(
                converter -> converter instanceof MappingJackson2HttpMessageConverter
        );
        restTemplate.getMessageConverters().add(new HtmlToJsonMessageConverter());

        return restTemplate;
    }
}