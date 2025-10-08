package com.navi.user.security;

import com.navi.user.repository.TryLoginRepository;
import com.navi.user.security.Filter.JWTCheckFilter;
import com.navi.user.security.Filter.TryLoginFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
@EnableWebSecurity
public class SecurityConfig {

    private final TryLoginRepository tryLoginRepository;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity security) throws Exception {
        security
                // ✅ 모든 요청을 인증 없이 허용
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll()
                )

                // ✅ CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ 세션 관리: STATELESS (JWT 기반)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ✅ 폼 로그인, 기본 로그인, CSRF 모두 비활성화
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .csrf(csrf -> csrf.disable());

        // ✅ JWT 필터 추가 (토큰이 있으면 로그인 건너뛰기)
       // security.addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class);
       // security.addFilterBefore(new TryLoginFilter(tryLoginRepository), UsernamePasswordAuthenticationFilter.class);

        return security.build();
    }

    // ✅ PasswordEncoder 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ CORS 세부 설정
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
