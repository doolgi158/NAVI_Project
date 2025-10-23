package com.navi.delivery.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.navi.common.enums.RsvStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryReservationDTO {

    private String drsvId;

    @NotBlank(message = "출발지 주소는 필수입니다.")
    private String startAddr;

    @NotBlank(message = "도착지 주소는 필수입니다.")
    private String endAddr;

    @NotNull(message = "배송일은 필수입니다.")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;

    @NotNull(message = "총 금액은 필수입니다.")
    @DecimalMin(value = "0", inclusive = true)
    private BigDecimal totalPrice;

    @NotNull(message = "사용자 번호는 필수입니다.")
    private Long userNo;

    private String groupId;

    private RsvStatus status;

    /**
     * 배송 시간대 (선택: 오전/오후) - 향후 확장 대비
     */
    private String timeSlot;

    /**
     * ✅ 가방 종류별 수량 정보 (예: {"S":2,"M":1,"L":0})
     */
    private Map<String, Integer> bags;

    private LocalDate createdAt;
    private LocalDate updatedAt;
}
