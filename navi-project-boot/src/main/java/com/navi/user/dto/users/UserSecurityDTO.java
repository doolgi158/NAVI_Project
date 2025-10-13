package com.navi.user.dto.users;

import com.navi.user.enums.UserState;

import lombok.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.*;
import java.util.stream.Collectors;

@ToString
@Getter
@Setter
public class UserSecurityDTO extends User {
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

    // 권한
    private List<String> role = new ArrayList<>();

    public UserSecurityDTO(String name, String phone, String birth, String email, String id, String pw, UserState userState, List<String> role) {
        super(id, pw, role.stream().map(str -> new SimpleGrantedAuthority("ROLE_" + str)).collect(Collectors.toList()));
        this.name = name;
        this.phone = phone;
        this.birth = birth;
        this.email = email;
        this.id = id;
        this.userState = userState;
        this.role = role;
    }

    public Map<String, Object> getClaims() {
        Map<String, Object> data = new HashMap<>();

        data.put("name", name);
        data.put("phone", phone);
        data.put("birth", birth);
        data.put("email", email);
        data.put("id", id);
        data.put("userState", userState);
        data.put("role", role);

        return data;
    }
}
