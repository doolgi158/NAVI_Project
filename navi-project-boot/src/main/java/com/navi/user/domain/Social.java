package com.navi.user.domain;

import com.navi.user.enums.SocialState;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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

    @Lob
    @Column(name = "cer_token", nullable = false)
    private String token;       // 리소스 토큰

    @Lob
    @Column(name = "cer_refresh")
    private String refresh;     // 리프레시 토큰

    @Enumerated(EnumType.STRING)
    @Column(name = "cer_type", nullable = false, length = 20)
    private SocialState type;  // 인증수단

    @CreationTimestamp
    @Column(name = "cer_request", nullable = false, updatable = false)
    private LocalDateTime request;     // 요청시간

    @Column(name = "cer_limit", nullable = false)
    private LocalDateTime limit;       // 유효기간

    @Column(name = "cer_confirm", nullable = false)
    private boolean confirm;       // 성공여부

    @OneToOne
    @JoinColumn(name = "user_no")
    private User user;
}
