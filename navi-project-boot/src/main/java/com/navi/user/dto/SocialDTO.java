package com.navi.user.dto;

import com.navi.user.domain.Social;
import com.navi.user.domain.User;
import com.navi.user.enums.SocialState;

import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return new SocialDTO(
                entity.getNo(),
                entity.getToken(),
                entity.getRefresh(),
                entity.isConfirm() ? 'T' : 'F',
                entity.getType(),
                entity.getRequest().format(formatter),
                entity.getLimit().format(formatter)
        );
    }

    public Social toEntity(User user) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return Social.builder()
                .no(this.no)
                .token(this.token)
                .refresh(this.refresh)
                .confirm(this.confirm == 'T')
                .type(this.type)
                .request(LocalDateTime.parse(this.request, formatter))
                .limit(LocalDateTime.parse(this.limit, formatter))
                .user(user)
                .build();
    }
}