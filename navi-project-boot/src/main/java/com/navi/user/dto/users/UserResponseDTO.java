package com.navi.user.dto.users;

import com.navi.user.enums.UserState;
import lombok.*;

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
    private char gender;            // 성별
    private String id;              // 아이디
    private char local;             // 내/외국인
    private UserState userState;    // 유저 상태
    private String signUp;          // 가입일
    private String token;           // 토큰
}
