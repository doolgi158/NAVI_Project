package com.navi.payment.service;

import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.request.PaymentConfirmRequestDTO;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentConfirmResponseDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentVerifyResponseDTO;
import com.navi.payment.repository.PaymentRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentsServiceImpl implements PaymentsService{
    private final IamportClient iamportClient;  // 아임포트 서버랑 직접 통신하는 클라이언트
    private final PaymentRepository paymentRepository;

    /* == 결제 플로우 == */
    // 1. 결제 준비 (merchantID 생성 및 임시 저장)
    @Override
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {
        log.info("결제 준비 요청 수신: {}", dto);

        PaymentMaster payment = PaymentMaster.builder()
                .totalAmount(dto.getTotalAmount())
                .paymentMethod(dto.getPaymentMethod())
                .paymentStatus(PaymentStatus.READY)
                .build();

        paymentRepository.save(payment);
        log.info("결제 ID 생성 완료: {}", payment.getMerchantId());

        // 프론트에 결제 ID 반환
        return PaymentPrepareResponseDTO.builder()
                .merchantId(payment.getMerchantId())
                .build();
    }

    // 2. 포트원 결제 검증
    @Override
    public PaymentVerifyResponseDTO verifyPayment(PaymentVerifyRequestDTO dto) throws IamportResponseException, IOException {
        return null;
    }

    // 3. 검증 성공 시 DB 반영 (검증 성공 시 결제 완료 처리 및 상세 저장)
    @Override
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto) {
        return null;
    }

    // 4. 결제 실패 시 상태 갱신
    @Override
    public void failPayment(String merchantId, String reason) {

    }

    // 5. 환불 요청 및 상태 변경
    @Override
    public void refundPayment(String merchantId, BigDecimal refundAmount, String reason) throws IamportResponseException, IOException {

    }


}
