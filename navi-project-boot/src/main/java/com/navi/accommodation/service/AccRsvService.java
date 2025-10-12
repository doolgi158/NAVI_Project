package com.navi.accommodation.service;

import com.navi.accommodation.dto.response.AccRsvResponseDTO;
import com.navi.reservation.domain.Rsv;

import java.time.LocalDate;
import java.util.List;

public interface AccRsvService {
    // 예약 생성
    void createAccReservation(Rsv rsv);

    // 예약 목록 전체 조회
    List<AccRsvResponseDTO> findAllDetails();
    // 사용자 ID 기준 예약 목록 조회
    List<AccRsvResponseDTO> findAllByUserNo(Long userNo);
    // 예약 ID 기준 예약 목록 조회
    List<AccRsvResponseDTO> findAllByReserveId(String reserveId);

    // 수수료 계산 시 필요한 체크인 날짜
    LocalDate findCheckInDateByReserveId(String reserveId);
}