package com.navi.user.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TryLoginDTO {
    private int count;      // 시도 횟수
    private char state;     // 성공 여부
    private String time;    // 로그인 시간
}
