package com.navi.user.domain;

import com.navi.user.enums.UserState;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "navi_users")
@SequenceGenerator(
        name = "navi_users_generator",
        sequenceName = "navi_users_seq",
        initialValue = 0,
        allocationSize = 1
)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_users_generator")
    @Column(name = "user_no")
    private long no;            // 사용자 번호

    @Column(name = "user_name", nullable = false)
    private String name;        // 이름

    @Column(name = "user_phone", nullable = false)
    private String phone;       // 전화번호

    @Column(name = "user_birth", nullable = false)
    private String birth;       // 생년월일

    @Column(name = "user_email", nullable = false)
    private String email;       // 이메일

    @Column(name = "user_gender")
    private char gender;        // 성별

    @Column(name = "user_pernum", nullable = false)
    private String perNum;      // 주민/여권번호

    @Column(name = "user_ID", nullable = false)
    private String ID;          // 아이디

    @Column(name = "user_PW", nullable = false)
    private String PW;          // 비밀번호

    @Column(name = "user_local")
    private char local;         // 내/외국인

    @Column(name = "user_signup", updatable = false)
    @ColumnDefault(value = "sysdate")
    @CreationTimestamp
    private String signUp;      // 가입일

    @Column(name = "user_state", nullable = false)
    @ColumnDefault(value = "0")
    @Enumerated(EnumType.STRING)
    private UserState userState; // 유저 상태
}
