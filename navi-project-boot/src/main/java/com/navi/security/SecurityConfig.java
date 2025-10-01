package com.navi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configurable
@RequiredArgsConstructor
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
        return security.build();
    }
}
