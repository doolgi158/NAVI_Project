package com.navi.reservation.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/*
 * ===================================
 * [NAVI_RSV_COUNTER] - RsvCounter
 * : 예약번호 카운터 관리 테이블
 * ===================================
 * ㄴ 예약 ID 생성 시 "YYYYMMDD + TYPE + 일련번호" 조합을 만들기 위한 카운터 테이블
 */

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_RSV_COUNTER")
@IdClass(RsvCounter.PK.class)       // --> 복합키 설정 (PK: 내부 클래스)
public class RsvCounter {
    /* === COLUMN 정의 === */
    // 카운터 기준 날짜 (예: 20251007)
    @Id @Column(name = "counter_date", length = 8)
    private String counterDate;

    // 예약 대상 구분 (예: ACC, AIR, DLV)
    @Id @Column(name = "target_type", length = 3)
    private String targetType;

    // 다음 시퀀스 번호 (예: 5 → 다음 예약 ID는 6)
    @Column(name = "next_seq", nullable = false)
    private Integer nextSeq;

    // 시퀀스 증가 (다음 예약번호 생성용)
    public void increment() { this.nextSeq++; }

    /*
     * ===================================
     * 복합키 클래스 (내부 정적 클래스)
     * ===================================
     * [1] implements Serializable : JPA는 PK를 직렬화해서 전송하므로 직렬화 필수
     * [2] equals(), hashCode() 구현 : 복합키 클래스가 값 동등성 비교를 지원해야 함 -> @Data가 자동 생성
     * [3] 필드명과 타입은 엔티티의 @Id 필드와 정확히 일치해야 함
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PK implements Serializable {
        private String counterDate;
        private String targetType;
    }
}
