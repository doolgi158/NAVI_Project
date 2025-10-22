package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminFlightReservationDTO;
import java.util.List;

public interface AdminFlightReservationService {

    /**
     * ✅ 조건별 예약 목록 조회
     */
    List<AdminFlightReservationDTO> findReservations(String status, String userName, String startDate, String endDate);

    /**
     * ✅ 단건 조회
     */
    AdminFlightReservationDTO findById(String frsvId);

    /**
     * ✅ 예약 상태 변경
     */
    void updateStatus(String frsvId, String newStatus);

    /**
     * ✅ 예약 삭제
     */
    void deleteReservation(String frsvId);

    /* 예약 전체 수정 */
    void updateReservation(String frsvId, AdminFlightReservationDTO dto);
}
