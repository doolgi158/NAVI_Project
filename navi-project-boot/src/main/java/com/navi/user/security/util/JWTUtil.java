package com.navi.user.security.util;

import com.navi.common.util.CustomException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Component
public class JWTUtil {
    private final SecretKey secretKey;

    // ✅ application.yml에서 secret 읽기
    public JWTUtil(@Value("${jwt.secret}") String secret) {
        // Base64 인코딩 필수 (JJWT 0.11.x 이상)
        this.secretKey = Keys.hmacShaKeyFor(Base64.getEncoder().encode(secret.getBytes(StandardCharsets.UTF_8)));
    }

    // JWT 문자열 토큰 생성
    public String generateToken(Map<String, Object> valueMap, int min) {
        try {
            return Jwts.builder()
                    .setHeader(Map.of("typ", "JWT"))
                    .setClaims(valueMap)
                    .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                    .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                    .signWith(secretKey)
                    .compact();
        } catch(Exception e) {
            throw new CustomException("토큰 생성 실패: " + e.getMessage(), 500, valueMap);
        }
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
}
