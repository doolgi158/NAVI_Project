package com.navi.user.dto.users;

import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    public static UserResponseDTO from(User user) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // 전화번호 포맷 (01012345678 → 010-1234-5678)
        String formattedPhone = user.getPhone();
        if (formattedPhone != null && formattedPhone.length() == 11) {
            formattedPhone = formattedPhone.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
        }

        // 생년월일 포맷 (20000101 → 2000-01-01)
        String formattedBirth = user.getBirth();
        if (formattedBirth != null && formattedBirth.length() == 8) {
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
                .signUp(user.getSignUp() != null ? user.getSignUp().format(formatter) : null)
                .build();
    }
}
