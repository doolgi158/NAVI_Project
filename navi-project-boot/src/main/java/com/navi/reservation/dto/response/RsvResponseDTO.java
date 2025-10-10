package com.navi.reservation.dto.response;

/*
 * ==============================
 * [RsvResponseDTO]
 * : 예약 확정 후 클라이언트에 반환되는 응답 DTO
 * ==============================
 * ㄴ 결제 검증이 완료되어 DB에 저장된 예약 정보를 반환
 */

import com.navi.reservation.domain.PaymentMethod;
import com.navi.reservation.domain.Rsv;
import com.navi.reservation.domain.RsvStatus;
import com.navi.reservation.domain.RsvType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvResponseDTO {
    private String reserveId;               // 예약 고유번호 (예: 20251007ACC001)
    private Long userNo;                    // 예약자 회원번호 (예: 10001)
    private RsvType rsvType;                // 예약 대상 구분 (예: ACC, AIR, DLV)
    private String targetId;                // 예약 대상 ID (예: ACC003)
    private String paymentId;               // 결제 승인번호 (예: IMP_67283051)
    private PaymentMethod paymentMethod;    // 결제 수단 (예: KAKAO_PAY)
    private Integer totalAmount;            // 총 결제 금액 (예: 128000)
    private RsvStatus rsvStatus;            // 결제 상태 (예: 결제완료)
    private LocalDateTime createdTime;      // 예약 생성 일시 (예: 2025-10-07T13:45:12)
    private LocalDateTime paymentTime;      // 결제 완료 일시 (예: 2025-10-07T13:47:03)
    private String paymentFailReason;       // 결제 실패 사유 (예: "카카오페이 승인 실패: 한도 초과")

    // DTO 변환 (Entity → DTO)
    public static RsvResponseDTO fromEntity(Rsv entity) {
        return RsvResponseDTO.builder()
                .reserveId(entity.getReserveId())
                .userNo(entity.getUser().getNo())
                .rsvType(entity.getRsvType())
                .targetId(entity.getTargetId())
                .paymentId(entity.getPaymentId())
                .paymentMethod(entity.getPaymentMethod())
                .totalAmount(entity.getTotalAmount() != null ? entity.getTotalAmount().intValue() : 0)
                .rsvStatus(entity.getRsvStatus())
                .createdTime(entity.getCreatedTime())
                .paymentTime(entity.getPaymentTime())
                .paymentFailReason(entity.getPaymentFailReason())
                .build();
    }
}
