package com.navi.delivery.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.navi.common.enums.RsvStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryReservationDTO {

    // 생성 시 서버에서 부여 (요청시 null 허용)
    private String drsvId;

    @NotBlank(message = "출발지 주소는 필수입니다.")
    private String startAddr;

    @NotBlank(message = "도착지 주소는 필수입니다.")
    private String endAddr;

    @NotNull(message = "배송일은 필수입니다.")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;

    @JsonAlias("totalAmount")
    @NotNull(message = "총 금액은 필수입니다.")
    @DecimalMin(value = "0", inclusive = true, message = "총 금액은 0 이상이어야 합니다.")
    private BigDecimal totalPrice;

    @NotNull(message = "예약 상태는 필수입니다.")
    private RsvStatus status; // 문자열이 아니라 공용 Enum

    @NotNull(message = "사용자 번호는 필수입니다.")
    private Long userNo;   // FK

    @NotNull(message = "가방 요금 ID는 필수입니다.")
    private Long bagId;    // FK

    // 그룹 배정 이전에도 생성 가능하게 하려면 필수 아님
    private String groupId; // FK (선택)
}
