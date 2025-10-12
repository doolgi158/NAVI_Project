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
@Table(name = "NAVI_BOOKMARK")
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookmark_id")
    private Long bookmarkId;

    /** 여행지 참조 **/
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id", nullable = false)
    private Travel travel;

    /** 사용자 참조 (FK: user_no) **/
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    /** 편의용 컬럼 (로그인 ID 문자열 저장) **/
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    // 편의 생성자
    public Bookmark(Travel travel, User user) {
        this.travel = travel;
        this.user = user;
        this.userId = user.getId(); // user_id 컬럼 자동 채움
    }

    public Long getTravelId() {
        return this.travel != null ? this.travel.getTravelId() : null;
    }

    public String getUserLoginId() {
        return this.user != null ? this.user.getId() : this.userId;
    }
}
