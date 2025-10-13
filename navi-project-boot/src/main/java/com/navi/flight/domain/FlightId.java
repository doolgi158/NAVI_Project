package com.navi.flight.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 항공편 복합키 (flightId + depTime)
 * - JPA 규칙: Embeddable + Serializable
 * - 컬럼명은 기본 필드명(flightId, depTime)으로 생성됨
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightId implements Serializable {

    /** 항공편 ID (예: KE3106, OZ3242) */
    private String flightId;

    /** 출발 시간 (예: 2025-10-02T09:00:00) */
    private LocalDateTime depTime;
}
