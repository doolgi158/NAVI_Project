package com.navi.travel.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    /**
     * DTO와 Entity 간의 매핑을 위한 ModelMapper
     */
    @Bean
    public ModelMapper modelMapper(){
        return new ModelMapper();
    }

    /**
     * 외부 API 호출을 위한 RestTemplate
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
