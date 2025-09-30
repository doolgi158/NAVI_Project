package com.NAVI_Project.flight.repository;

import com.NAVI_Project.flight.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
}
