package com.navi.user.dto.users;

import com.navi.image.domain.Image;
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
    private LocalDateTime signUp;   // 가입일
    private String token;           // 토큰
    private String path;            // 프로필 URL

    public static UserResponseDTO from(User user, Image profile) {
        return UserResponseDTO.builder()
                .no(user.getNo())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .gender(user.getGender())
                .local(user.getLocal())
                .signUp(user.getSignUp() != null ? user.getSignUp() : null)
                .path(profile != null ? profile.getPath() : null)
                .build();
    }
}
