package com.navi.admin.user.dto;

import com.navi.user.domain.History;
import com.navi.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDTO {
    private Long userNo;
    private String userId;
    private String userName;
    private String userGender;
    private String userBirth;
    private String userEmail;
    private String userPhone;
    private String userLocal;
    private String userSignup;
    private String userState;
    private String historyIp;
    private String historyLogin;
    private String historyLogout;

    private static final DateTimeFormatter SIGNUP_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    public static AdminUserDTO of(User user, History history) {
        return AdminUserDTO.builder()
                .userNo(user.getNo())
                .userId(user.getId())
                .userName(user.getName())
                .userGender(user.getGender())
                .userBirth(user.getBirth())
                .userEmail(user.getEmail())
                .userPhone(user.getPhone())
                .userLocal(
                        user.getLocal() == null ? "미상" :
                                user.getLocal().equals("L") ? "내국인" : "외국인"
                )
                .userSignup(user.getSignUp() != null ? user.getSignUp().format(SIGNUP_FORMATTER) : "-")
                .userState(user.getUserState().name())
                .historyIp(history != null ? history.getIp() : "-")
                .historyLogin(history != null && history.getLogin() != null ? history.getLogin().format(DATE_TIME_FORMATTER) : "-")
                .historyLogout(history != null && history.getLogout() != null ? history.getLogout().format(DATE_TIME_FORMATTER) : "-")
                .build();
    }
}