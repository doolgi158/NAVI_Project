package com.navi.user.dto.users;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Getter
@Setter
public class UserRequestDTO {
    private String name;            // 이름
    private String phone;           // 전화번호
    private String birth;           // 생년월일
    private String email;           // 이메일
    private char gender;            // 성별
    private String id;              // 아이디
    private char local;             // 내/외국인
    private String pw;              // 비밀번호
}
