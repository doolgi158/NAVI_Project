package com.navi.user.dto.response;

import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {
    private long no;                // 사용자 번호
    private String name;            // 이름
    private String phone;           // 전화번호
    private String birth;           // 생년월일
    private String email;           // 이메일
    private String gender;          // 성별
    private String id;              // 아이디
    private String local;           // 내/외국인
    private UserState userState;    // 유저 상태
    private String signUp;          // 가입일
    private String token;           // 토큰
    private String profile;         // 프로필 경로
    private List<String> role;      // 권한

    public static UserResponseDTO from(User user) {
        if (user == null) return null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // 전화번호 포맷 (01012345678 → 010-1234-5678)
        String formattedPhone = user.getPhone();
        if (formattedPhone != null && formattedPhone.matches("\\d{11}")) {
            formattedPhone = formattedPhone.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
        }

        // 생년월일 포맷 (20000101 → 2000-01-01)
        String formattedBirth = user.getBirth();
        if (formattedBirth != null && formattedBirth.matches("\\d{8}")) {
            formattedBirth = formattedBirth.replaceFirst("(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
        }

        return UserResponseDTO.builder()
                .no(user.getNo())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(formattedPhone)
                .birth(formattedBirth)
                .gender(user.getGender())
                .local(user.getLocal())
                .userState(user.getUserState())
                .signUp(user.getSignUp() != null ? user.getSignUp().format(formatter) : null)
                .role(user.getUserRoleList().stream()
                        .map(Enum::name)
                        .collect(Collectors.toList()))
                .build();
    }
}
