package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminFlightDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminFlightService {

    /** 전체 항공편 목록 조회 */
    List<AdminFlightDTO> getAllFlights();

    /** 단건 항공편 조회 */
    AdminFlightDTO getFlight(String flightId, LocalDateTime depTime);

    /** 신규 항공편 등록 */
    AdminFlightDTO createFlight(AdminFlightDTO dto);

    /** 항공편 수정 */
    AdminFlightDTO updateFlight(String flightId, LocalDateTime depTime, AdminFlightDTO dto);

    /** 항공편 삭제 */
    void deleteFlight(String flightId, LocalDateTime depTime);
}
