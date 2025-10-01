<<<<<<<< HEAD:naviProjectBoot/src/main/java/com/navi/flight/domain/FlightId.java
package com.navi.flight.domain;
========
package com.navi.flight.entity;
>>>>>>>> ced1df1312dfc51a7344e267650a76e6c46e525a:NAVI_Project_Boot/src/main/java/com/navi/flight/entity/FlightId.java

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightId implements Serializable { // 복합키 생성
    private String flightId;
    private LocalDateTime depTime;
}
