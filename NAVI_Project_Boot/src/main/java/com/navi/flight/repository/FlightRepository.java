package com.navi.flight.repository;
<<<<<<<< HEAD:naviProjectBoot/src/main/java/com/navi/flight/repository/FlightRepository.java

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;

========

import com.navi.flight.entity.Flight;
import com.navi.flight.entity.FlightId;
>>>>>>>> ced1df1312dfc51a7344e267650a76e6c46e525a:NAVI_Project_Boot/src/main/java/com/navi/flight/repository/FlightRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
