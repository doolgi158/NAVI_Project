package com.navi.reservation.dto.request;

/*
 * ==============================
 * [RsvConfirmRequestDTO]
 * : 결제 후 예약 확정 단계 DTO
 * ==============================
 * ㄴ 아임포트 결제 성공 후, imp_uid 등 결제 결과를 포함하여 백엔드에 전달
 */

import com.navi.reservation.domain.Rsv;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvConfirmRequestDTO {
    private Long userNo;                        // 예약자 회원번호
    private Rsv.TargetType targetType;          // 예약 유형
    private String targetId;                    // 예약 대상 ID
    private Rsv.PaymentMethod paymentMethod;    // 결제 수단
    private Integer totalAmount;                // 총 결제 금액
    private String reserveId;                   // 예약 고유번호
    private Rsv.PaymentStatus paymentStatus;    // 결제 상태
    private String paymentId;                   // 결제 승인 번호(imp_uid)
    private LocalDateTime paymentTime;          // 결제 완료 시각
    private String paymentFailReason;           // 결제 실패 사유
}
