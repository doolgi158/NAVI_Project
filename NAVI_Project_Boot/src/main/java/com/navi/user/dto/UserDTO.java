package com.navi.user.dto;

import com.navi.user.enums.UserState;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private long no;                // 사용자 번호
    private String name;            // 이름
    private String phone;           // 전화번호
    private String birth;           // 생년월일
    private String email;           // 이메일
    private char gender;            // 성별
    private String perNum;          // 주민/여권번호
    private String ID;              // 아이디
    private String PW;              // 비밀번호
    private char local;             // 내/외국인
    private UserState userState;    // 유저 상태
    private String signUp;          // 가입일

    // 권한
    private List<String> role = new ArrayList<>();
}
