package com.NAVI_Project.flight.entity;

import com.NAVI_Project.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "navi_flight")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight extends BaseEntity { //등록일 수정일 자동생성 상속

    @EmbeddedId
    private FlightId id; //복합키 설정

    @Column(name = "airline_nm", nullable = false, length = 50)
    private String airlineNm;

    @Column(name = "dep_airport_nm", nullable = false, length = 50)
    private String depAirportNm;

    @Column(name = "arr_airport_nm", nullable = false, length = 50)
    private String arrAirportNm;

    @Column(name = "arr_time", nullable = false)
    private LocalDateTime arrTime;

    @Column(name = "economy_charge", nullable = false)
    private int economyCharge; //일반석 가격 항상 존재함

    @Column(name = "prestigeCharge")
    private Integer prestigeCharge; //일부 항공편 프레스티지석 없음.

}
