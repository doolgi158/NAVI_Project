package com.NAVI_Project.flight.domain;

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
