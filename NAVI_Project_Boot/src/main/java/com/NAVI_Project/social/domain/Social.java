package com.NAVI_Project.social.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
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
    public enum ProviderType {
        GOOGLE,     // 0
        KAKAO,      // 1
        NAVER,      // 2
        EMAIL       // 3
    }

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
    private ProviderType type;  // 인증수단

    @Column(name = "cer_request", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private String request;     // 요청시간

    @Column(name = "cer_limit", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private String limit;       // 유효기간

    @Column(name = "cer_confirm", nullable = false)
    private char confirm;       // 성공여부
}
