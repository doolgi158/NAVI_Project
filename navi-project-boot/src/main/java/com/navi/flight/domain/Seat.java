package com.navi.flight.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "navi_seat",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"flight_id", "dep_time", "seat_no"})
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatId; //좌석 고유 ID (PK)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "flight_id", referencedColumnName = "flightId"),
            @JoinColumn(name = "dep_time", referencedColumnName = "depTime")
    })
    private Flight flight;

    @Column(name = "seat_no", nullable = false, length = 5)
    private String seatNo; //좌석 번호 (1A, 2C, 3D...)

    @Setter
    @Column(name = "is_reserved", nullable = false)
    private boolean isReserved; // 예약여부 (true = 예약 / false = 빈좌석)

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", nullable = false, length = 10)
    private SeatClass seatClass; // ECONOMY / PRESTIGE
}
