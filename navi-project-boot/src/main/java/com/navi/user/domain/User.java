package com.navi.user.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.navi.travel.domain.Bookmark;
//import com.navi.travel.domain.Like;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
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
    private String gender;        // 성별

    @Column(name = "user_id", nullable = false, unique = true)
    private String id;          // 아이디

    @Column(name = "user_pw", nullable = false)
    private String pw;          // 비밀번호

    @Column(name = "user_local")
    private String local;         // 내/외국인

    @Column(name = "user_signup", updatable = false)
    @CreationTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDateTime signUp;      // 가입일

    @Column(name = "user_state", nullable = false)
    @ColumnDefault(value = "'NORMAL'")
    @Enumerated(EnumType.STRING)
    private UserState userState; // 유저 상태

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Social social;      // 소셜 로그인

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<History> histories = new ArrayList<>();    // 로그인 이력

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "navi_user_roles", joinColumns = @JoinColumn(name = "user_no"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private List<UserRole> userRoleList = new ArrayList<>();    // 권한

//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List<Bookmark> bookmarks = new ArrayList<>();   // 북마크
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List<Like> likes = new ArrayList<>();   // 좋아요

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Withdraw withdraw;

    public void addRole(UserRole userRole) {
        userRoleList.add(userRole);
    }
    public void clearRole(UserRole userRole) {
        userRoleList.clear();
    }

    // Builder로 비밀번호 변경 (임시 비밀번호용)
    public User changePassword(String encodedPw) {
        return this.toBuilder()   // 현재 필드들을 복제한 Builder 시작
                .pw(encodedPw)    // 비밀번호만 교체
                .build();
    }

    // Spring Security나 DTO 변환 시 사용하기 위한 Getter
    public List<UserRole> getRoleList() {
        return this.userRoleList;
    }
}