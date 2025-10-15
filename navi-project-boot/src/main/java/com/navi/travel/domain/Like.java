package com.navi.travel.domain;

import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "NAVI_LIKE",
        uniqueConstraints = @UniqueConstraint(columnNames = {"USER_NO", "TRAVEL_ID"})
)
@SequenceGenerator(name = "like_seq", sequenceName = "LIKE_SEQ", allocationSize = 1)
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "like_seq")
    @Column(name = "LIKE_ID")
    private Long likeId;

    /** ✅ 여행지 (N:1) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRAVEL_ID", nullable = false)
    private Travel travel;

    /** ✅ 사용자 (N:1) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_NO", nullable = false)
    private User user;

    /** ✅ 사용자 ID (백업용) */
    @Column(name = "USER_ID", length = 50, nullable = true)
    private String userId;

    /** ✅ 생성자 (관계 자동 설정) */
    public Like(Travel travel, User user) {
        this.travel = travel;
        this.user = user;
        this.userId = user.getId();

        // 연관관계 편의 메서드
        if (travel != null) {
            travel.addLike(this);
        }
    }

    public Long getTravelId() {
        return this.travel != null ? this.travel.getTravelId() : null;
    }

    public String getUserLoginId() {
        return this.user != null ? this.user.getId() : this.userId;
    }
}
