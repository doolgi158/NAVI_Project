package com.navi.user.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface DashboardFlightRepository extends JpaRepository<Flight, FlightId> {
    @Query("""
            SELECT COUNT(f)
            FROM Flight f
            WHERE f.createdAt BETWEEN :start AND :end
            """)
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
