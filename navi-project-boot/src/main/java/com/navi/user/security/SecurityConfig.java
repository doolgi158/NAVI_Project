package com.navi.user.security;

import com.navi.user.repository.TryLoginRepository;
import com.navi.user.security.Filter.JWTCheckFilter;
import com.navi.user.security.Filter.TryLoginFilter;
import com.navi.user.security.handler.ApiFailHandler;
import com.navi.user.security.handler.ApiSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final TryLoginRepository tryLoginRepository;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
        // CORS 설정
        security.cors(httpSecurityCorsConfigurer -> {
            httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
        });

        // 세션 관리 정책 설정
        security.sessionManagement(sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // CSRF 설정
        security.csrf(config -> config.disable());

        // 로그인 설정
        security.formLogin(config -> {
            config.loginProcessingUrl("/api/users/login")
                    .usernameParameter("username")
                    .passwordParameter("password");
            config.successHandler(new ApiSuccessHandler(tryLoginRepository));
            config.failureHandler(new ApiFailHandler(tryLoginRepository));
        });

        // JWT 체크 (토큰 정보가 있으면 로그인을 건너뛴다)
        security.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class);
        security.addFilterBefore(new TryLoginFilter(tryLoginRepository), UsernamePasswordAuthenticationFilter.class);
        return security.build();
    }

    // Password 암호화
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // CORS 세부 설정
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("POST", "GET", "DELETE", "PUT", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
