package com.navi.user.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WithdrawDTO {
    private long id;                // 이력 ID
    private String request;         // 탈퇴 요청일
    private String due;     // 탈퇴 예정일
    private String end;     // 탈퇴 처리일
    private String reason;  // 탈퇴 사유
}
