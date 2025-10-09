package com.navi.user.dto;

import com.navi.user.domain.Social;
import com.navi.user.enums.SocialState;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SocialDTO {
    private Long no;            // 인증 번호
    private String token;       // 리소스 토큰
    private String refresh;     // 리프레시 토큰
    private char confirm;       // 성공여부
    private SocialState type;   // 인증수단
    private String request;     // 요청시간
    private String limit;       // 유효기간

    public static SocialDTO fromEntity(Social entity) {
        return new SocialDTO(
                entity.getNo(),
                entity.getToken(),
                entity.getRefresh(),
                entity.isConfirm() ? 'T' : 'F',
                entity.getType(),
                entity.getRequest().toString(),
                entity.getLimit().toString()
        );
    }
}