package com.navi.user.security.util;

import com.navi.common.util.CustomException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

@Slf4j
public class JWTUtil {
    private static final String key = "1234567890123456789012345678901234567890";

    public static String generateToken(Map<String, Object> valueMap, int min) {
        SecretKey key = null;

        try {
            key = Keys.hmacShaKeyFor(JWTUtil.key.getBytes("UTF-8"));
        } catch(Exception e) {
            throw new CustomException(e.getMessage(), 500, null);
        }

        return Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();
    }

    public static Map<String, Object> validateToken(String token) {
        Map<String, Object> claim = null;

        try{
            SecretKey key = Keys.hmacShaKeyFor(JWTUtil.key.getBytes("UTF-8"));
            claim = Jwts.parserBuilder()
                    .setSigningKey(key).build()
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

        return claim;
    }
}
