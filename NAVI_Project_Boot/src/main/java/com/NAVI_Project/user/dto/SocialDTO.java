package com.NAVI_Project.user.dto;

import com.NAVI_Project.user.enums.SocialState;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialDTO {
    private Long no;            // 인증 번호
    private String token;       // 리소스 토큰
    private String refresh;     // 리프레시 토큰
    private char confirm;       // 성공여부
    private SocialState type;  // 인증수단

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private String request;     // 요청시간

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private String limit;       // 유효기간
}
