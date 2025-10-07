package com.navi.reservation.dto.request;

/*
 * ============================================
 * [RsvRequestDTO]
 * : 예약 생성 시 클라이언트에서 전달되는 데이터 DTO
 * =============================================
 */

import com.navi.reservation.domain.Rsv;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
//@Builder
public class RsvRequestDTO {
    private Long userNo;
    private Rsv.TargetType targetType;
    private String targetId;
    private Rsv.PaymentMethod paymentMethod;
    private Integer totalAmount;

    private String reserveId;
    private LocalDateTime createdTime;
    private Rsv.PaymentStatus paymentStatus;
    private String paymentId;
    private LocalDateTime paymentTime;
    private String paymentFailReason;
}
