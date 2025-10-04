package com.navi.flight.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * 좌석 엔티티
 * - ERD: NAVI_SEAT
 * - PK: seat_id (단일 PK)
 * - FK: (flight_id, dep_time) → NAVI_FLIGHT
 * - Unique: 한 항공편 내 동일 좌석번호 중복 불가
 */
@Entity
@Table(
        name = "navi_seat",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"flight_id", "dep_time", "seat_no"})
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    /** 좌석 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long seatId;

    /** 항공편 (복합키 FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "flight_id", referencedColumnName = "flightId"),
            @JoinColumn(name = "dep_time", referencedColumnName = "depTime")
    })
    private Flight flight;

    /** 좌석 번호 (예: 1A, 2B, 30F) */
    @Column(name = "seat_no", length = 5, nullable = false)
    private String seatNo;

    /** 예약 여부 (true = 예약됨, false = 빈좌석) */
    @Setter
    @Column(name = "is_reserved", nullable = false)
    private boolean isReserved;

    /** 좌석 등급 (ECONOMY / PRESTIGE) */
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", length = 20, nullable = false)
    private SeatClass seatClass;
}
