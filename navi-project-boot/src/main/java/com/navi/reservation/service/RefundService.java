//package com.navi.reservation.service;
//
//import com.navi.reservation.domain.Refund;
//import com.navi.reservation.dto.request.RefundRequestDTO;
//import com.navi.reservation.dto.response.RefundResponseDTO;
//
//import java.util.List;
//
//public interface RefundService {
//    /** === 관리자 기능 === */
//    // 전체 환불 내역 조회
//    List<RefundResponseDTO> findAllRefunds();
//
//    // 상태별 환불 목록 조회
//    List<RefundResponseDTO> findRefundsByStatus(Refund.RefundStatus status);
//
//    // 환불 상태 변경
//    RefundResponseDTO updateRefundStatus(Long refundId, Refund.RefundStatus newStatus);
//
//    /** === 사용자 기능 === */
//    // 환불 요청 처리 (수수료 계산 + 환불 생성)
//    RefundResponseDTO requestRefund(RefundRequestDTO dto);
//
//    // 예약 ID로 환불 단건 조회
//    RefundResponseDTO findByReserveId(String reserveId);
//}
