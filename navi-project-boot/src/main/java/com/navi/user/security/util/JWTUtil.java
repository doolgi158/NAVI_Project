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

    // ✅ [1] 토큰 생성 시 claim 이름 통일 (roles → role)
    public String generateToken(JWTClaimDTO claim, int minutes) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", claim.getId());
        claims.put("name", claim.getName());
        claims.put("email", claim.getEmail());
        claims.put("role", claim.getRole()); // ✅ 통일된 key 사용
        claims.put("phone", claim.getPhone());
        claims.put("birth", claim.getBirth());
        claims.put("provider", claim.getProvider());

        Date exp = Date.from(ZonedDateTime.now().plusMinutes(minutes).toInstant());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(exp)
                .signWith(secretKey)
                .compact();
    }

    public String generateToken(Map<String, Object> claims, int minutes) {
        Date exp = Date.from(ZonedDateTime.now().plusMinutes(minutes).toInstant());
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(exp)
                .signWith(secretKey)
                .compact();
    }

    // ✅ [2] 토큰 검증 시 'roles' 또는 'role' 어느 쪽이든 허용 (호환성)
    public JWTClaimDTO validateAndParse(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Object roleClaim = claims.get("role");
        if (roleClaim == null) {
            roleClaim = claims.get("roles"); // ✅ 과거 토큰 호환 처리
        }

        // ✅ [3] roleClaim이 List가 아닐 경우 안전하게 처리
        List<UserRole> roleList;
        if (roleClaim instanceof List<?>) {
            roleList = ((List<?>) roleClaim).stream()
                    .map(r -> UserRole.valueOf(r.toString()))
                    .toList();
        } else if (roleClaim instanceof String) {
            roleList = List.of(UserRole.valueOf(roleClaim.toString()));
        } else {
            roleList = List.of(UserRole.USER); // 기본 USER 권한
        }

        return JWTClaimDTO.builder()
                .id((String) claims.get("id"))
                .name((String) claims.get("name"))
                .email((String) claims.get("email"))
                .phone((String) claims.get("phone"))
                .birth((String) claims.get("birth"))
                .provider((String) claims.get("provider"))
                .role(roleList)
                .build();
    }

    // JWT 토큰 체크해서 유저 정보 반환
    public Map<String, Object> validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
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
}
