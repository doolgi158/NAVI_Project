package com.navi.flight.service;

<<<<<<<< HEAD:naviProjectBoot/src/main/java/com/navi/flight/service/FlightService.java
import com.navi.flight.domain.Flight;
========
import com.navi.flight.entity.Flight;
>>>>>>>> ced1df1312dfc51a7344e267650a76e6c46e525a:NAVI_Project_Boot/src/main/java/com/navi/flight/service/FlightService.java

public interface FlightService {
    public void saveFlight(Flight flight);
    public void reserveSeat(Long seatId, String userName);
}
