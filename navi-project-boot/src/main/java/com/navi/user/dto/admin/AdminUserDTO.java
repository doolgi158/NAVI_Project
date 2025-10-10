package com.navi.user.dto.admin;

import lombok.*;
import java.time.LocalDateTime;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDTO {
    private Long userNo;            // 사용자 번호
    private String userId;          // 아이디
    private String userName;        // 이름
    private String userGender;      // 성별
    private String userBirth;       // 생년월일
    private String userEmail;       // 이메일
    private String userPhone;       // 전화번호
    private String userLocal;       // 내/외국인
    private String userSignup;      // 가입일
    private String userState;       // 상태 (정상/휴면/탈퇴 등)

    // History 테이블
    private String historyIp;        // 로그인 IP
    private String historyLogin;     // 로그인 시각
    private String historyLogout;    // 로그아웃 시각
}