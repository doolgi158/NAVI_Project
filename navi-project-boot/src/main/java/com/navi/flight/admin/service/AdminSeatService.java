package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminSeatDTO;
import com.navi.flight.admin.dto.AdminSeatUpdateRequest;
import com.navi.flight.domain.SeatClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminSeatService {

    Page<AdminSeatDTO> searchAll(String flightId, LocalDateTime depTime,
                                 Boolean reserved, SeatClass seatClass,
                                 String q, Pageable pageable);

    Page<AdminSeatDTO> getSeatsByFlight(String flightId, LocalDateTime depTime, Pageable pageable);

    List<AdminSeatDTO> getSeatsByFlight(String flightId, LocalDateTime depTime);

    AdminSeatDTO patchSeat(Long seatId, AdminSeatUpdateRequest req);

    void deleteOne(Long seatId);

    List<AdminSeatDTO> getAllSeats();

    List<AdminSeatDTO> getSeatsByFlightId(String flightId);

    void resetSeats(String flightId, LocalDateTime depTime);

    void deleteSeats(String flightId, LocalDateTime depTime);

    /**
     * ✅ 새 좌석 등록
     */
    AdminSeatDTO addSeat(String flightId, LocalDateTime depTime);
}
