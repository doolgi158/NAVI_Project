package com.navi.accommodation.service;

import com.navi.accommodation.domain.AccRsv;
import com.navi.accommodation.dto.response.AccRsvResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface AccRsvService {
    /* == 관리자용 == */
    // 1. 전체 숙소 예약 목록 조회
    List<AccRsvResponseDTO> getAllReservations();
    // 2. 숙소별 예약 목록 조회
    List<AccRsv> getRsvByAccId(String accId);
    // 2. 특정 숙소의 하루 단위 예약 수 조회
    int getRsvCountByAccIdAndDate(String accId, LocalDate targetDate);

    /* == 사용자용 == */
    // 1. 사용자 ID별 숙소 예약 목록 조회
    List<AccRsvResponseDTO> findAllByUserId(String userId);
    // 2. 예약 ID 기준 숙소 상세 예약 목록 조회
    List<AccRsvResponseDTO> findAllByArsvId(String arsvId);

    /* == [비즈니스 로직용] == */
    // 1. 수수료 계산 시 필요한 체크인 날짜
    LocalDate findCheckInDateByArsvId(String arsvId);

    // Todo: payment로 옮겨야 함
    // 1. 결제 검증 후 결제 내역 생성
    //void createAccReservation(AccRsvRequestDTO dto);
}