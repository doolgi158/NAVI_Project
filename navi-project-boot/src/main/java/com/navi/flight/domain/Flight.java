package com.navi.flight.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "navi_flight")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight extends BaseEntity {

    /** 복합키 (편명 + 출발일시) */
    @EmbeddedId
    private FlightId id;

    @Column(name = "airline_nm", nullable = false, length = 50)
    private String airlineNm;

    /** 출발 공항 (FK → Airport.airport_code) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dep_airport_code", nullable = false)
    private Airport depAirport;

    /** 도착 공항 (FK → Airport.airport_code) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arr_airport_code", nullable = false)
    private Airport arrAirport;

    @Column(name = "arr_time", nullable = false)
    private LocalDateTime arrTime;

    @Column(name = "economy_charge", nullable = false)
    private int economyCharge;

    @Column(name = "prestige_charge")
    private Integer prestigeCharge;

    /* 좌석 지연 생성 여부 (초기 false → 최초 생성 후 true) */
    @Column(name = "seat_initialized", nullable = false)
    @Builder.Default
    @Setter
    private boolean seatInitialized = false;
}
