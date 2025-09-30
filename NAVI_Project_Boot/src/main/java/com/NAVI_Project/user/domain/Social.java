package com.NAVI_Project.user.domain;

import com.NAVI_Project.user.enums.SocialState;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "navi_certify")
@SequenceGenerator(
        name = "navi_certify_generator",
        sequenceName = "navi_certify_seq",
        initialValue = 1,
        allocationSize = 1
)
public class Social {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_certify_generator")
    @Column(name = "cer_no")
    private Long no;            // 인증 번호

    @Column(name = "cer_token", nullable = false)
    private String token;       // 리소스 토큰

    @Column(name = "cer_refresh", nullable = false)
    private String refresh;     // 리프레시 토큰

    @Enumerated(EnumType.STRING)
    @Column(name = "cer_type", nullable = false)
    private SocialState type;  // 인증수단

    @Column(name = "cer_request", nullable = false)
    private String request;     // 요청시간

    @Column(name = "cer_limit", nullable = false)
    private String limit;       // 유효기간

    @Column(name = "cer_confirm", nullable = false)
    private char confirm;       // 성공여부
}
