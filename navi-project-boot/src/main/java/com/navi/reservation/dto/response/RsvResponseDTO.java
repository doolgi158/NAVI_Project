package com.navi.reservation.dto.response;

import com.navi.reservation.domain.Rsv;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvResponseDTO {
    private String reserveId;
    private Rsv.TargetType targetType;
    private Rsv.PaymentStatus paymentStatus;
    private Rsv.PaymentMethod paymentMethod;
    private Integer totalAmount;
    private LocalDateTime createdTime;
    private LocalDateTime paymentTime;
    private String paymentId;
    private String paymentFailReason;

    /* 단순 변환 메서드 (비즈니스 로직 없음) */
    public static RsvResponseDTO fromEntity(Rsv rsv) {
        return RsvResponseDTO.builder()
                .reserveId(rsv.getReserveId())
                .targetType(rsv.getTargetType())
                .paymentStatus(rsv.getPaymentStatus())
                .paymentMethod(rsv.getPaymentMethod())
                .totalAmount(rsv.getTotalAmount())
                .createdTime(rsv.getCreatedTime())
                .paymentTime(rsv.getPaymentTime())
                .paymentId(rsv.getPaymentId())
                .paymentFailReason(rsv.getPaymentFailReason())
                .build();
    }
}
