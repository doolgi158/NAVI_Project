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
}
