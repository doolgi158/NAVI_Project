package com.navi.flight.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "navi_airport")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Airport {

    @Id
    @Column(name = "airport_code", length = 10, nullable = false) // PK = 공항 코드
    private String airportCode;   // ex) CJU, GMP

    @Column(name = "airport_name", length = 50, nullable = false)
    private String airportName;   // ex) 제주, 김포
}
