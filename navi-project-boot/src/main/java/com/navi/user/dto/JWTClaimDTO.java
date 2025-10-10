package com.navi.user.dto;

import com.navi.user.domain.User;
import com.navi.user.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JWTClaimDTO {
    private String id;        // 사용자 아이디
    private String name;      // 이름
    private String email;     // 이메일
    private String phone;     // 전화번호
    private String birth;     // 생년월일
    private String provider;  // 소셜 로그인 제공자 (google, kakao 등)
    private List<UserRole> role;    // 권한
    private String accessToken;
    private String refreshToken;

    // 사용자 계정 기반 Claim
    public static JWTClaimDTO fromUser(User user) {
        return JWTClaimDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .role(user.getUserRoleList())
                .build();
    }

    // 소셜 로그인 기반 Claim
    public static JWTClaimDTO fromSocial(String provider, String email, String name) {
        return JWTClaimDTO.builder()
                .provider(provider)
                .email(email)
                .name(name)
                .role(List.of(UserRole.USER))
                .build();
    }

    // 가장 첫 번째 권한 반환 (편의 메서드)
    public String getPrimaryRole() {
        return role != null && !role.isEmpty() ? role.get(0).name() : UserRole.USER.name();
    }
}
