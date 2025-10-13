package com.navi.location.domain;

/*
 * ============================================
 * [NAVI_TOWNSHIP] - 읍면동 테이블
 * ============================================
 */

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Check;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "NAVI_TOWNSHIP",
        uniqueConstraints = {   // 두 개 이상의 칼럼을 묶어서 중복을 막는 제약조건
                @UniqueConstraint(columnNames = {"sigungu_id", "township_name"})
        }
)
@Check(constraints = "sigungu_id IN (110, 130)")
@SequenceGenerator(
        name = "township_generator",
        sequenceName = "TOWNSHIP_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class Township {
    /* === COLUMN 정의 === */
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "township_generator")
    @Column(name = "township_id")
    private Long townshipId;

    @Column(name = "sigungu_id", nullable = false)
    private Integer sigunguId;

    @Column(name = "sigungu_name", nullable = false)
    private String sigunguName;

    @Column(name = "township_name", nullable = false)
    private String townshipName;

}
