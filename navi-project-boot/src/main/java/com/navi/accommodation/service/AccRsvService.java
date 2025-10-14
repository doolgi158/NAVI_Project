package com.navi.accommodation.service;

import com.navi.accommodation.dto.request.AccRsvRequestDTO;
import com.navi.accommodation.dto.response.AccRsvResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface AccRsvService {
    /* 관리자용 */
    // 1. 결제 검증 후 숙소 상세 예약 생성
    void createAccReservation(AccRsvRequestDTO dto);
    // 2. 전체 숙소 상세 예약 목록 조회
    List<AccRsvResponseDTO> findAllDetails();

    /* 사용자용 */
    // 1. 사용자 ID별 숙소 예약 목록 조회
    List<AccRsvResponseDTO> findAllByUserId(Long userNo);
    // 2. 예약 ID 기준 숙소 상세 예약 목록 조회회
    List<AccRsvResponseDTO> findAllByReserveId(String reserveId);
    // 3. 수수료 계산 시 필요한 체크인 날짜
    LocalDate findCheckInDateByReserveId(String reserveId);
}