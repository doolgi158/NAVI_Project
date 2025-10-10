package com.navi.travel.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // ✅ 모든 필드를 포함하는 생성자 추가

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // ✅ 모든 필드를 포함하는 생성자 추가
@Table(name = "user_likes")
// 사용자와 여행지 ID를 복합키 대신 단순 키와 인덱스로 관리합니다.
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId;

    // ✅ 필수 값(nullable = false) 명시
    @Column(name = "travel_id", nullable = false)
    private Long travelId;

    // ✅ 필수 값(nullable = false) 명시, 타입 String으로 변경 완료
    @Column(name = "user_id", nullable = false)
    private String id;

    // 편의를 위한 생성자
    public Like(Long travelId, String id) {
        this.travelId = travelId;
        this.id = id;
    }
}