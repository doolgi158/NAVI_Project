<<<<<<<< HEAD:naviProjectBoot/src/main/java/com/navi/flight/domain/Flight.java
package com.navi.flight.domain;
========
package com.navi.flight.entity;
>>>>>>>> ced1df1312dfc51a7344e267650a76e6c46e525a:NAVI_Project_Boot/src/main/java/com/navi/flight/entity/Flight.java

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

    @Column(name = "prestige_charge")
    private Integer prestigeCharge; //일부 항공편 프레스티지석 없음.

}
