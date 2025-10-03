//package com.navi.user.security.util;
//
//import com.navi.common.util.CustomException;
//import io.jsonwebtoken.*;
//import io.jsonwebtoken.security.Keys;
//
//import javax.crypto.SecretKey;
//import java.time.ZonedDateTime;
//import java.util.Date;
//import java.util.Map;
//
//public class JWTUtil {
//    private static final String stringKey = "1234567890123456789012345678901234567890";
//
//    // JWT 문자열 토큰 생성
//    public static String generateToken(Map<String, Object> valueMap, int min) {
//        SecretKey secretKey;
//
//        try {
//            secretKey = Keys.hmacShaKeyFor(stringKey.getBytes("UTF-8"));
//        } catch(Exception e) {
//            throw new CustomException(e.getMessage(), 500, valueMap);
//        }
//
//        return Jwts.builder()
//                .setHeader(Map.of("typ", "JWT"))
//                .setClaims(valueMap)
//                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
//                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
//                .signWith(secretKey)
//                .compact();
//    }
//
//    // JWT 토큰 체크해서 유저 정보 반환
//    public static Map<String, Object> validateToken(String token) {
//        Map<String, Object> claim;
//
//        try{
//            SecretKey secretKey = Keys.hmacShaKeyFor(stringKey.getBytes("UTF-8"));
//            claim = Jwts.parserBuilder()
//                    .setSigningKey(secretKey).build()
//                    .parseClaimsJws(token).getBody();
//        } catch(MalformedJwtException malformedJwtException) {
//            throw new MalformedJwtException(malformedJwtException.getMessage());
//        } catch(ExpiredJwtException | InvalidClaimException ex) {
//            throw new CustomException(ex.getMessage(), 401, null);
//        } catch(JwtException jwtException) {
//            throw new JwtException(jwtException.getMessage());
//        } catch(Exception e) {
//            throw new CustomException(e.getMessage(), 500, null);
//        }
//
//        return claim;
//    }
//}
