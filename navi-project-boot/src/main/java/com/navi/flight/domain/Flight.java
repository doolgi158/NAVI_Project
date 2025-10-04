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

    @EmbeddedId
    private FlightId id; // 복합키 (편명 + 출발일시)

    @Column(name = "airline_nm", nullable = false, length = 50)
    private String airlineNm; // 항공사명

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
    private int economyCharge; // 일반석 요금

    @Column(name = "prestige_charge")
    private Integer prestigeCharge; // null 허용 (프레스티지 없는 항공편)
}
