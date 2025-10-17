package com.navi.user.dto;

import com.navi.user.domain.User;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@Slf4j
public class JWTClaimDTO {
    private String id;        // 사용자 아이디
    private String name;      // 이름
    private String email;     // 이메일
    private String phone;     // 전화번호
    private String birth;     // 생년월일
    private String provider;  // 소셜 로그인 제공자 (google, kakao 등)
    private List<String> role;    // 권한
    private String ip;
    private String accessToken;
    private String refreshToken;
    private UserState state;

    // 사용자 계정 기반 Claim
    public static JWTClaimDTO fromUser(User user) {
        return JWTClaimDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .role(
                        user.getUserRoleList().stream()
                                .map(UserRole::name)
                                .collect(Collectors.toList())
                )
                .state(user.getUserState())
                .build();
    }

    // 소셜 로그인 기반 Claim
    public static JWTClaimDTO fromSocial(String provider, String email, String name) {
        return JWTClaimDTO.builder()
                .provider(provider)
                .email(email)
                .name(name)
                .role(List.of(UserRole.USER.name())) // Enum.name() → String
                .build();
    }


    // 가장 첫 번째 권한 반환 (편의 메서드)
    public String getPrimaryRole() {
        return role != null && !role.isEmpty() ? role.get(0) : UserRole.USER.name();
    }
//
//    public JWTClaimDTO validateAndParse(String token) {
//        try {
//            Claims claims = Jwts.parser()
//                    .setSigningKey(secretKey)
//                    .parseClaimsJws(token)
//                    .getBody();
//
//            return convertToDTO(claims);
//        } catch (ExpiredJwtException e) {
//            throw e; // ✅ 무조건 던지기 (필터가 catch로 감지함)
//        } catch (Exception e) {
//            throw new RuntimeException("Invalid JWT Token");
//        }
//    }
}
