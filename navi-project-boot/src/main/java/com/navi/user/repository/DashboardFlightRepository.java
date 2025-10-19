package com.navi.user.repository;

import com.navi.flight.domain.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardFlightRepository extends JpaRepository<Flight, Long> {
}
