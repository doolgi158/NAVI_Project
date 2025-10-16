//package com.navi.payment.dto.response;
//
//import com.navi.payment.domain.PaymentMaster;
//import com.navi.payment.domain.enums.PaymentMethod;
//import com.navi.common.enums.RsvType;
//import com.navi.payment.domain.enums.PaymentStatus;
//import lombok.*;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//
///* =================[RsvResponseDTO]=================
//        결제 완료 후 클라이언트에 반환되는 응답 DTO
//     EX) 결제 정보 SELECT - 마이페이지 등 상세 정보 출력
//   ================================================== */
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class PaymentDetailResponseDTO {
//    private String merchantId;              // 결제 ID (예: 20251007ACC001)
//    private RsvType reserveType;            // 예약 대상 구분 (예: ACC, AIR, DLV)
//    private String reserveId;               // 예약 ID (예: 20250923ACC001)
//    private PaymentStatus paymentStatus;    // 결제 상태 (예: PAID) Todo: Enum으로 매핑 로직 변경 필요
//    private String impUid;                  // 결제 승인번호 (예: IMP_67283051)
//    private PaymentMethod paymentMethod;    // 결제 수단 (예: KAKAOPAY)
//    private BigDecimal totalAmount;         // 총 결제 금액 (예: 128000)
//    private LocalDateTime createdAt;        // 결제 완료 일시 (예: 2025-10-07T13:47:03)
//
//    // TODO: 타입별 예약 상세 정보 가져오기
//
//    // DTO 변환 (Entity → DTO)
//    public static PaymentDetailResponseDTO fromEntity(PaymentMaster entity) {
//        return PaymentDetailResponseDTO.builder()
//                .paymentId(entity.getPaymentId())
//                .reserveType(entity.getReserveType())
//                .reserveId(entity.getReserveId())
//                .paymentMethod(entity.getPaymentMethod())
//                .totalAmount(entity.getTotalAmount() != null ? entity.getTotalAmount() : BigDecimal.ZERO)
//                .paymentStatus(entity.getPaymentStatus())
//                .createdAt(entity.getCreatedAt())
//                .build();
//    }
//}