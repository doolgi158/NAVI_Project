package com.navi.flight.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "navi_flight")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight extends BaseEntity {

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "flightId", column = @Column(name = "flight_id")),
            @AttributeOverride(name = "depTime", column = @Column(name = "dep_time"))
    })
    private FlightId flightId;

    @Column(name = "airline_nm", nullable = false, length = 50)
    private String airlineNm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dep_airport_code", nullable = false)
    private Airport depAirport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arr_airport_code", nullable = false)
    private Airport arrAirport;

    @Column(name = "arr_time", nullable = false)
    private LocalDateTime arrTime;

    @Column(name = "economy_charge", nullable = false)
    private int economyCharge;

    @Column(name = "prestige_charge", nullable = false)
    private Integer prestigeCharge;

    @Builder.Default
    @Column(name = "seat_initialized", nullable = false)
    private boolean seatInitialized = false;

    @OneToMany(mappedBy = "flight", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();

    @OneToMany(mappedBy = "flight", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<FlightReservation> reservations = new ArrayList<>();
}
