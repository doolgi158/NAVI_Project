package com.navi.payment.controller;

import com.navi.accommodation.repository.AccRepository;
import com.navi.common.enums.RsvType;
import com.navi.delivery.service.DeliveryReservationService;
import com.navi.flight.service.FlightReservationService;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.request.RefundRequestDTO;
import com.navi.payment.dto.response.PaymentAdminDetailResponseDTO;
import com.navi.payment.dto.response.PaymentAdminListResponseDTO;
import com.navi.payment.service.PaymentAdminService;
import com.navi.room.repository.RoomRsvRepository;
import com.navi.room.service.RoomRsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm/payment")
public class PaymentAdminController {
    private final PaymentAdminService paymentAdminService;
    private final RoomRsvService roomReservationService;
    private final FlightReservationService flightReservationService;
    private final DeliveryReservationService deliveryReservationService;

    @GetMapping("/list")
    public ResponseEntity<List<PaymentAdminListResponseDTO>> getAdminPayments(
            @RequestParam(required = false) RsvType rsvType,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) String keyword
    ) {
        List<PaymentAdminListResponseDTO> payments = paymentAdminService.getAllPaymentsForAdmin(rsvType, paymentStatus, keyword);

        if (payments.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 응답 (데이터 없음)
        }

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/reservation/{rsvType}/{reserveId}")
    public ResponseEntity<Object> getReservationDetail(
            @PathVariable RsvType rsvType,
            @PathVariable String reserveId
    ) {
        log.info("🔎 [ADMIN] 예약 상세 조회 요청 - type={}, reserveId={}", rsvType, reserveId);

        Object reservationDetail;
        switch (rsvType) {
            case ACC -> reservationDetail = roomReservationService.findByReserveId(reserveId);
            case FLY -> reservationDetail = flightReservationService.getReservationById(reserveId);
            case DLV -> reservationDetail = deliveryReservationService.getReservationById(reserveId);
            default -> throw new IllegalArgumentException("Unsupported type: " + rsvType);
        }

        return ResponseEntity.ok(reservationDetail);
    }

    @GetMapping("/details/{merchantId}")
    public ResponseEntity<List<PaymentAdminDetailResponseDTO>> getPaymentDetails(
            @PathVariable String merchantId
    ) {
        log.info("🔍 [ADMIN API] 단일 결제 상세 조회 요청 - merchantId={}", merchantId);

        List<PaymentAdminDetailResponseDTO> details =
                paymentAdminService.getPaymentDetailsForAdmin(merchantId);

        return ResponseEntity.ok(details);
    }

    @PostMapping("/refund/master")
    public ResponseEntity<String> refundMaster(@RequestBody RefundRequestDTO dto) throws Exception {
        log.info("💰 [ADMIN API] 전체 환불 요청 수신 - {}", dto);
        paymentAdminService.refundPaymentByMerchantId(dto);
        return ResponseEntity.ok("전체 환불이 완료되었습니다.");
    }

    @PostMapping("/refund/detail")
    public ResponseEntity<String> refundDetail(@RequestBody RefundRequestDTO dto) throws Exception {
        log.info("💰 [ADMIN API] 부분 환불 요청 수신 - {}", dto);
        paymentAdminService.refundPaymentByReserveId(dto);
        return ResponseEntity.ok("부분 환불이 완료되었습니다.");
    }
}
