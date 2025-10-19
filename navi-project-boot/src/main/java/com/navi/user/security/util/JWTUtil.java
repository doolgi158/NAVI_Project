package com.navi.user.security.util;

import com.navi.common.util.CustomException;
import com.navi.user.dto.JWTClaimDTO;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JWTUtil {
    private final SecretKey secretKey;

    // application.properties에서 secret 읽기
    public JWTUtil(@Value("${jwt.secret}") String secret) {
        // Base64 인코딩 필수 (JJWT 0.11.x 이상)
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 생성 (DTO 기반)
    public String generateToken(JWTClaimDTO claim, int minutes) {
        Map<String, Object> claims = Map.of(
                "id", claim.getId(),
                "name", claim.getName(),
                "email", claim.getEmail(),
                "role", claim.getRole(),
                "state", claim.getState()
        );

        Date exp = Date.from(ZonedDateTime.now().plusMinutes(minutes).toInstant());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(exp)
                .signWith(secretKey)
                .compact();
    }

    // Map 기반 generateToken
    public String generateToken(Map<String, Object> claims, int minutes) {
        Date exp = Date.from(ZonedDateTime.now().plusMinutes(minutes).toInstant());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(exp)
                .signWith(secretKey)
                .compact();
    }

    // 토큰 검증 및 Claim 복원
    public JWTClaimDTO validateAndParse(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // role 필드 안전하게 꺼내기
            Object roleObj = claims.get("role");
            List<String> roles;

            if (roleObj instanceof List<?>) {
                roles = ((List<?>) roleObj).stream()
                        .map(Object::toString)
                        .toList();
            } else if (roleObj instanceof String singleRole) {
                roles = List.of(singleRole);
            } else {
                roles = List.of("USER");
            }

            return JWTClaimDTO.builder()
                    .id((String) claims.get("id"))
                    .name((String) claims.get("name"))
                    .email((String) claims.get("email"))
                    .role(roles)
                    .state(null) // 필요 시 state 필드도 추출
                    .build();

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // accessToken 만료 시 필터가 감지하도록 그대로 던짐
            throw e;
        } catch (Exception e) {
            // 기타 토큰 오류 처리
            throw new RuntimeException("Invalid JWT Token", e);
        }
    }

    // JWT 토큰 체크해서 유저 정보 반환
    public Map<String, Object> validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey).build()
                    .parseClaimsJws(token).getBody();
        } catch (MalformedJwtException malformedJwtException) {
            throw new MalformedJwtException(malformedJwtException.getMessage());
        } catch (ExpiredJwtException | InvalidClaimException ex) {
            throw new CustomException(ex.getMessage(), 401, null);
        } catch (JwtException jwtException) {
            throw new JwtException(jwtException.getMessage());
        } catch (Exception e) {
            throw new CustomException(e.getMessage(), 500, null);
        }
    }

    public String getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return (String) claims.get("id");
        } catch (JwtException e) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
    }

    // 토큰을 Claims 형태로 파싱 (만료 포함)
    public Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT Token: " + e.getMessage(), e);
        }
    }

    // 만료 여부 검사
    public boolean isExpired(String token) {
        try {
            Claims claims = parseClaims(token);
            Date exp = claims.getExpiration();
            return exp.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }
}