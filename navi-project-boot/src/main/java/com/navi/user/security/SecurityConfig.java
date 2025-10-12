package com.navi.user.security;

import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.Filter.JWTCheckFilter;
import com.navi.user.security.Filter.TryLoginFilter;
import com.navi.user.security.handler.ApiFailHandler;
import com.navi.user.security.handler.ApiLogoutSuccessHandler;
import com.navi.user.security.handler.ApiSuccessHandler;
import com.navi.user.security.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final TryLoginRepository tryLoginRepository;
    private final JWTUtil jwtUtil;
    private final ApiLogoutSuccessHandler apiLogoutSuccessHandler;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity security) throws Exception {

        // ✅ CORS 설정
        security.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // ✅ 세션 관리
        security.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // ✅ CSRF 비활성화
        security.csrf(csrf -> csrf.disable());

        // ✅ 요청 권한 설정
        security.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        // 로그인/회원가입 관련
                        "/api/users/login",
                        "/api/users/logout",
                        "/api/auth/oauth/**",
                        "/api/users/find-id",
                        "/api/users/find-pw",
                        "/api/users/signup",
                        "/api/users/check-id",
                        "/api/users/send-email",
                        "/api/users/verify-code",
                        "/api/users/find-password",

                        // ✅ 공공 데이터, 항공편, 짐배송 등
                        "/api/flight/**",
                        "/api/delivery/**",
                        "/api/seats/**"
                ).permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().authenticated()
        );

        // ✅ 로그인 필터 설정
        security.formLogin(config -> {
            config.loginProcessingUrl("/api/users/login")
                    .usernameParameter("username")
                    .passwordParameter("password")
                    .successHandler(new ApiSuccessHandler(tryLoginRepository, jwtUtil, userRepository, historyRepository))
                    .failureHandler(new ApiFailHandler(tryLoginRepository));
        });

        // ✅ JWT 필터 & 로그인 시도 필터 연결
        security.addFilterAfter(new JWTCheckFilter(jwtUtil), LogoutFilter.class);
        security.addFilterAfter(new TryLoginFilter(tryLoginRepository), JWTCheckFilter.class);

        return security.build();
    }

    // ✅ PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ CORS 세부 설정
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("POST", "GET", "DELETE", "PUT", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
