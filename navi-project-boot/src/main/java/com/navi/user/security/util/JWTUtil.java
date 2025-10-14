package com.navi.user.security.util;

import com.navi.common.util.CustomException;
import com.navi.user.dto.JWTClaimDTO;
import com.navi.user.enums.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.*;

@Component
public class JWTUtil {
    private final SecretKey secretKey;

    // application.properties에서 secret 읽기
    public JWTUtil(@Value("${jwt.secret}") String secret) {
        // Base64 인코딩 필수 (JJWT 0.11.x 이상)
        this.secretKey = Keys.hmacShaKeyFor(Base64.getEncoder().encode(secret.getBytes(StandardCharsets.UTF_8)));
    }


    // 생성 (DTO 기반)
    public String generateToken(JWTClaimDTO claim, int minutes) {
        Map<String, Object> claims = Map.of(
                "id", claim.getId(),
                "name", claim.getName(),
                "email", claim.getEmail(),
                "role", claim.getRole()
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
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // role 필드 안전하게 꺼내기 (List<String> 타입으로 변환)
        Object roleObj = claims.get("role");
        List<String> roles = null;

        if (roleObj instanceof List<?>) {
            roles = ((List<?>) roleObj).stream()
                    .map(Object::toString) // Enum이든 문자열이든 안전하게 문자열로 변환
                    .toList();
        } else if (roleObj instanceof String singleRole) {
            roles = List.of(singleRole);
        } else {
            roles = List.of("USER"); // 기본값
        }

        return JWTClaimDTO.builder()
                .id((String) claims.get("id"))
                .name((String) claims.get("name"))
                .email((String) claims.get("email"))
                .phone((String) claims.get("phone"))
                .birth((String) claims.get("birth"))
                .provider((String) claims.get("provider"))
                .role(roles)
                .build();
    }

    // JWT 토큰 체크해서 유저 정보 반환
    public Map<String, Object> validateToken(String token) {
        try{
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey).build()
                    .parseClaimsJws(token).getBody();
        } catch(MalformedJwtException malformedJwtException) {
            throw new MalformedJwtException(malformedJwtException.getMessage());
        } catch(ExpiredJwtException | InvalidClaimException ex) {
            throw new CustomException(ex.getMessage(), 401, null);
        } catch(JwtException jwtException) {
            throw new JwtException(jwtException.getMessage());
        } catch(Exception e) {
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
}
