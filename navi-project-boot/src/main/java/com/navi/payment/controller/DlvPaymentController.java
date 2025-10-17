package com.navi.payment.controller;

import com.navi.delivery.dto.DeliveryReservationDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentVerifyResponseDTO;
import com.navi.payment.service.DlvPaymentService;
import com.siot.IamportRestClient.exception.IamportResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment/delivery")
public class DlvPaymentController {

    private final DlvPaymentService dlvPaymentService;

    /** 1️⃣ 예약 + 결제 동시 생성 */
    @PostMapping("/prepare")
    public ResponseEntity<PaymentPrepareResponseDTO> preparePayment(@RequestBody DeliveryReservationDTO dto) {
        log.info("📦 [짐배송 결제 준비 요청] {}", dto);
        PaymentPrepareResponseDTO response = dlvPaymentService.preparePayment(dto);
        return ResponseEntity.ok(response);
    }

    /** 2️⃣ 결제 검증 및 확정 처리 */
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerifyResponseDTO> verifyPayment(@RequestBody PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {
        log.info("📦 [짐배송 결제 검증 요청] {}", dto);
        PaymentVerifyResponseDTO response = dlvPaymentService.verifyAndCompletePayment(dto);
        return ResponseEntity.ok(response);
    }
}
