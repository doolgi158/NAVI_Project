package com.NAVI_Project.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TryLoginDTO {
    private int count;      // 시도 횟수
    private char state;     // 성공 여부

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private String time;    // 로그인 시간
}
