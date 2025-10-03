package com.navi.flight.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 항공편 복합키 (flight_id + dep_time)
 * - ERD 기준: flight_id(VARCHAR2(20)) + dep_time(DATE)
 * - Serializable 필수 (JPA 복합키 규칙)
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightId implements Serializable {

    /** 항공편 ID
     *  예: KE3106, OZ3242
     */
    private String flightId;

    /** 출발 시간 (출발일시)
     *  예: 2025-10-02 09:00:00
     */
    private LocalDateTime depTime;
}
