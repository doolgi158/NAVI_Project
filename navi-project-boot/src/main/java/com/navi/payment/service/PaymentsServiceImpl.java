package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
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
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
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
    @Transactional(readOnly = true)
    public PaymentVerifyResponseDTO verifyPayment(PaymentVerifyRequestDTO dto) throws IamportResponseException, IOException {
        log.info("결제 검증 요청 수신 - impUid : {}", dto.getImpUid());

        boolean success = false;
        String message  = null;
        String impUid = null;
        String merchantId = null;

        // PortOne 서버에서 결제 정보 조회
        IamportResponse<Payment> response = iamportClient.paymentByImpUid(dto.getImpUid());
        Payment paymentInfo = response.getResponse();

        // 결제 금액 검증
        if (paymentInfo == null || paymentInfo.getAmount() == null) {
            log.error("PortOne 응답이 비어있거나 결제 금액이 없습니다. impUid={}", dto.getImpUid());
            message = "결제 정보 조회 실패";
        }else {
            impUid = paymentInfo.getImpUid();
            merchantId = paymentInfo.getMerchantUid();

            if (paymentInfo.getAmount().compareTo(dto.getTotalAmount()) != 0) {
                log.warn("결제 금액 불일치 - 요청 금액: {}, 실제 결제 금액: {}", dto.getTotalAmount(), paymentInfo.getAmount());
                message = "결제 금액 불일치";
            }else {
                log.info("결제 검증 성공: impUid={}, amount={}", dto.getImpUid(), dto.getTotalAmount());
                message = "결제 검증 성공";
                success = true;
            }
        }

        return PaymentVerifyResponseDTO.builder()
                .success(success)
                .message(message)
                .impUid(impUid)
                .merchantId(merchantId)
                .build();
    }

    // 3. 검증 성공 시 DB 반영 (검증 성공 시 결제 완료 처리 및 상세 저장)
    @Override
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto) {
        log.info("결제 확정 요청 수신 - impUid : {}", dto.getImpUid());

        // 결제 마스터 조회
        PaymentMaster payment = paymentRepository.findByMerchantId(dto.getMerchantId())
                .orElseThrow(() -> new IllegalArgumentException("결제 정보가 존재하지 않습니다."));

        // 결제 완료 처리
        payment.markAsPaid(dto.getImpUid(), dto.getPaymentMethod());
        paymentRepository.save(payment);

        // 3. 결제 상세 INSERT (아직 구현 안 함)
        // paymentDetailRepository.save(...)

        // 4️⃣ 응답 반환
        return PaymentConfirmResponseDTO.builder()
                .merchantId(payment.getMerchantId())
                .reserveIds(dto.getReserveIds())
                .rsvStatus(RsvStatus.PAID)
                .build();
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
