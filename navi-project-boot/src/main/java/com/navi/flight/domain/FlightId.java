package com.navi.flight.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 항공편 복합키 (flightId + depTime)
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightId implements Serializable {

    private String flightId;     // ex: KE3106
    private LocalDateTime depTime;  // ex: 2025-10-02T09:00
}
