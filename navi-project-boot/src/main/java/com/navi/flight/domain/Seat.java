package com.navi.flight.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * 좌석 엔티티
 */
@Entity
@Table(
        name = "navi_fly_seat",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"flight_id", "dep_time", "seat_no"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long seatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "flight_id", referencedColumnName = "flight_id"),
            @JoinColumn(name = "dep_time", referencedColumnName = "dep_time")
    })
    @JsonIgnore
    private Flight flight;

    @Column(name = "seat_no", length = 5, nullable = false)
    private String seatNo;

    @Setter
    @Column(name = "is_reserved", nullable = false)
    private boolean isReserved;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", length = 20, nullable = false)
    private SeatClass seatClass;

    /**
     * 좌석 추가요금
     */
    @Column(name = "extra_price", nullable = false)
    private int extraPrice;
}
