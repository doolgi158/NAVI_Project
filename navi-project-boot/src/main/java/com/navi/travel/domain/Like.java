package com.navi.travel.domain;

import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "NAVI_LIKE")
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id", nullable = false)
    private Travel travel; // ⭐️ Travel 엔티티 참조

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_ID", nullable = false)
    private User user;

    // 편의를 위한 생성자
    public Like(Travel travel, User user) {
        this.travel = travel;
        this.user = user;
    }

    public Long getTravelId() {
        return this.travel != null ? this.travel.getTravelId() : null;
    }
    
    public String getUserId() {
        return this.user != null ? this.user.getId() : null;
    }
}