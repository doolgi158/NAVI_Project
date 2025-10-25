package com.navi.security.util;

import com.navi.common.util.CustomException;
import com.navi.user.dto.auth.JWTClaimDTO;
import com.navi.user.enums.UserState;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
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
                "no", claim.getNo(),
                "id", claim.getId(),
                "name", claim.getName(),
                "email", claim.getEmail(),
                "role", claim.getRole(),
                "state", claim.getState() != null ? claim.getState().name() : UserState.NORMAL.name()
        );
        return generateToken(claims, minutes);
    }

    // Map 기반 토큰 생성 (공통 로직)
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

            // state 필드 파싱
            UserState state = UserState.NORMAL;
            Object stateObj = claims.get("state");
            if (stateObj instanceof String s) {
                try {
                    state = UserState.valueOf(s);
                } catch (IllegalArgumentException ignored) {
                    state = UserState.NORMAL;
                }
            }
            return JWTClaimDTO.builder()
                    .no(((Number) claims.get("no")).longValue())
                    .id((String) claims.get("id"))
                    .name((String) claims.get("name"))
                    .email((String) claims.get("email"))
                    .role(roles)
                    .state(state)
                    .build();

        } catch (ExpiredJwtException e) {
            throw e;
        } catch (JwtException e) {
            throw new CustomException("유효하지 않은 JWT 토큰입니다.", 401, null);
        } catch (Exception e) {
            throw new CustomException("JWT 파싱 중 오류 발생", 500, e.getMessage());
        }
    }

    // 특정 Claim 반환
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            // Refresh 토큰의 경우 만료되어도 클레임이 필요할 수 있으므로 Claims 반환
            return e.getClaims();
        } catch (JwtException e) {
            throw new CustomException("유효하지 않은 토큰입니다.", 401, null);
        } catch (Exception e) {
            throw new CustomException("토큰 파싱 중 오류 발생", 500, e.getMessage());
        }
    }

    // 특정 사용자 ID만 추출
    public String getUserIdFromToken(String token) {
        Map<String, Object> claims = parseToken(token);
        return (String) claims.get("id");
    }

    // 토큰 만료 여부 검사
    public boolean isExpired(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            throw new CustomException("만료 검사 중 오류 발생", 500, e.getMessage());
        }
    }
}