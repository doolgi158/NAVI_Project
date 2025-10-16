//package com.navi.reservation.service;
//
//import com.navi.reservation.domain.Rsv;
//import com.navi.reservation.dto.request.RsvConfirmRequestDTO;
//import com.navi.reservation.dto.request.RsvPreRequestDTO;
//import com.navi.reservation.dto.response.RsvResponseDTO;
//import java.util.List;
//
//public interface RsvService {
//    /* === 관리자 기능 === */
//    // 1. 전체 예약 목록 조회
//    List<Rsv> findAllRsv();
//    // 2. 예약 상태에 따른 숙소 조회 (예: WAITING_PAYMENT, PAID, CANCELLED 등)
//    List<Rsv> findRsvByStatus(String status);
//
//    /* === 사용자 기능 === */
//    // 1. 사용자별 예약 목록 조회
//    List<Rsv> findAllByUserNo(Long userNo);
//
//    /* === 결제 로직 === */
//    // 1. 결제 전 임시 예약 생성 (예약 ID 생성 + WAITING_PAYMENT 상태 저장)
//    Rsv createPendingReservation(RsvPreRequestDTO dto);
//    // 2. 결제 검증 완료 후 예약 확정 (결제 성공 → PAID 상태 업데이트)
//    RsvResponseDTO confirmPaymentRsv(String reserveId, String impUid, String paymentMethod);
//    // 3. 결제 검증 실패 시 예약 취소 (금액 불일치, 위조 결제 등 → CANCELLED)
//    RsvResponseDTO cancelPayment(String reserveId, String reason);
//    // 4. 결제 실패 시 예약 해제 (사용자 결제 중단, 결제 오류 등 → FAILED)
//    void failPayment(String reserveId, String reason);
//    // 5. 가상계좌 발급 시 입금 대기 처리 (-> READY)
//    RsvResponseDTO updateReadyStatus(String reserveId);
//}
