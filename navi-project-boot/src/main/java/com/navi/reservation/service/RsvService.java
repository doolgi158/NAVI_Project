package com.navi.reservation.service;

import com.navi.reservation.domain.Rsv;
import com.navi.reservation.dto.request.RsvConfirmRequestDTO;
import com.navi.reservation.dto.request.RsvPreRequestDTO;
import com.navi.reservation.dto.response.RsvResponseDTO;
import java.util.List;

public interface RsvService {
    /** === 관리자 기능 === */
    // 전체 숙소 조회
    List<Rsv> findAllRsv();
    // 운영 상태에 따른 숙소 조회
    List<Rsv> findRsvByStatus(String status);

    /** === 사용자 기능 === */
    // 사용자별 예약 전체 조회
    List<Rsv> findAllByUserNo(Long userNo);

    /* === 결제 로직 === */
    // 결제 검증 완료 후 예약 확정
    RsvResponseDTO confirmPaymentRsv(String reserveId, String impUid, String paymentMethod);
    // 결제 전 임시 예약 생성
    Rsv createPendingReservation(RsvPreRequestDTO dto);
    // Todo: 결제 취소/실패 시 예약 해제
}
