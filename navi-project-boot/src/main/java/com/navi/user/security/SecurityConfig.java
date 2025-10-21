package com.navi.user.security;

import com.navi.user.enums.UserRole;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.TryLoginRepository;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.filter.JWTCheckFilter;
import com.navi.user.security.filter.TryLoginFilter;
import com.navi.user.security.handler.ApiFailHandler;
import com.navi.user.security.handler.ApiLogoutSuccessHandler;
import com.navi.user.security.handler.ApiSuccessHandler;
import com.navi.user.security.util.JWTUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final TryLoginRepository tryLoginRepository;
    private final JWTUtil jwtUtil;
    private final ApiLogoutSuccessHandler apiLogoutSuccessHandler;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // CORS 설정
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // 세션 비활성화 (JWT 사용)
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // CSRF 비활성화
        http.csrf(csrf -> csrf.disable());

        // 요청별 권한 설정 (anyRequest는 반드시 마지막!)
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/adm/**", "/api/admin/**").hasRole(UserRole.ADMIN.name())
                .requestMatchers("/api/users/**", "/api/seats/**", "/api/travel/**", "/api/flight/**", "/api/delivery/**",
                        "/api/auth/**", "/api/accommodations/**", "/api/townships/**", "/api/rooms/**", "/api/reservation/**",
                        "/api/activity", "/api/payment/**", "/uploads/**", "/images/**")
                        .permitAll()
                .requestMatchers("/api/users/detail/**").hasAnyRole(UserRole.USER.name())
                .anyRequest().permitAll()
        );

        // 폼 로그인
        http.formLogin(login -> login
                .loginProcessingUrl("/api/users/login")
                .usernameParameter("username")
                .passwordParameter("password")
                .successHandler(new ApiSuccessHandler(tryLoginRepository, jwtUtil, userRepository, historyRepository))
                .failureHandler(new ApiFailHandler(tryLoginRepository))
        );

        // 예외 처리
        http.exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Unauthorized or token expired\"}");
                })
        );

        // JWT 필터 추가
        http.addFilterBefore(new JWTCheckFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(new TryLoginFilter(tryLoginRepository, userRepository), JWTCheckFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedOriginPatterns(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/uploads/**", "/images/**");
    }

}
