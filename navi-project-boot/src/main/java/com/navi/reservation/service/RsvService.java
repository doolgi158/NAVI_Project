package com.navi.reservation.service;

import com.navi.reservation.domain.Rsv;
import com.navi.reservation.dto.request.RsvConfirmRequestDTO;
import com.navi.reservation.dto.request.RsvPreRequestDTO;
import com.navi.reservation.dto.response.RsvResponseDTO;

import java.util.List;

public interface RsvService {
    /** === 관리자 기능 === */
    // 전체 예약 목록 조회
    List<Rsv> findAllRsv();

    // 결제 상태별 예약 목록 조회
    List<Rsv> findRsvByStatus(String status);

    /** === 사용자 기능 === */
    // 결제 완료 후 예약 확정
    Rsv confirmRsv(RsvConfirmRequestDTO dto);

    // 사용자별 예약 전체 조회
    List<Rsv> findAllByUserNo(Long userNo);

    // 예약 단건 조회
    //Rsv findByReserveId(String reserveId);

    /** === 결제 검증 완료 후 예약 확정 === */
    RsvResponseDTO confirmPaymentRsv(String reserveId, String impUid, String paymentMethod);
}