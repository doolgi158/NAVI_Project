package com.navi.payment.service;

import com.navi.common.enums.RsvStatus;
import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.payment.dto.request.PaymentConfirmRequestDTO;
import com.navi.payment.dto.request.PaymentPrepareRequestDTO;
import com.navi.payment.dto.request.PaymentVerifyRequestDTO;
import com.navi.payment.dto.response.PaymentConfirmResponseDTO;
import com.navi.payment.dto.response.PaymentPrepareResponseDTO;
import com.navi.payment.dto.response.PaymentVerifyResponseDTO;
import com.navi.payment.repository.PaymentDetailRepository;
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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    private final IamportClient iamportClient;  // 아임포트 서버랑 직접 통신하는 클라이언트
    private final PaymentRepository paymentRepository;
    private final PaymentDetailRepository paymentDetailRepository;

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
    @Transactional
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto) {
        log.info("결제 확정 요청 수신 - merchantId={}, reserveType={}, items={}",
                dto.getMerchantId(), dto.getReserveType(), dto.getItems());

        // 결제 마스터 조회
        PaymentMaster master = paymentRepository.findByMerchantId(dto.getMerchantId())
                .orElseThrow(() -> new IllegalArgumentException("해당 결제 ID에 대한 내역이 존재하지 않습니다."));

        // 중복 결제 방지
        if (master.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("이미 결제 완료된 건입니다.");
        }

        // 마스터 상태 갱신
        master.markAsPaid(dto.getImpUid(), dto.getPaymentMethod());
        log.debug("결제 마스터 상태 갱신 완료: {}", master.getMerchantId());

        // 상세 항목 생성 (예약별 금액 구조)
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("결제 상세 항목(items)이 비어 있습니다.");
        }

        // 결제 상세 INSERT
        BigDecimal total = BigDecimal.ZERO;
        for (PaymentConfirmRequestDTO.ReservePaymentItem item : dto.getItems()) {
            PaymentDetail detail = PaymentDetail.builder()
                    .paymentMaster(master)
                    .reserveType(dto.getReserveType())
                    .reserveId(item.getReserveId())
                    .amount(item.getAmount())
                    .build();

            // 상세 합산
            master.addPaymentDetail(detail);
            total = total.add(item.getAmount());
        }

        master.updateTotalAmount(total);
        paymentRepository.save(master);
        log.info("결제 확정 저장 완료 - merchantId={}, totalAmount={}", master.getMerchantId(), total);

        // 응답 반환
        return PaymentConfirmResponseDTO.builder()
                .merchantId(master.getMerchantId())
                .reserveIds(dto.getItems().stream()
                        .map(PaymentConfirmRequestDTO.ReservePaymentItem::getReserveId)
                        .toList())
                .rsvStatus(RsvStatus.PAID)
                .build();
    }

    // 4. 결제 실패 시 상태 갱신
    @Override
    @Transactional
    public void failPayment(String merchantId, String reason) {
        log.warn("결제 실패 처리 요청 수신 - merchantId={}, reason={}", merchantId, reason);

        // 결제 마스터 조회
        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("해당 결제 ID에 대한 내역이 존재하지 않습니다."));

        // 이미 결제 완료나 환불 상태면 실패처리 불가
        if (master.getPaymentStatus() == PaymentStatus.PAID
                || master.getPaymentStatus() == PaymentStatus.REFUNDED) {
            log.info("이미 결제 완료 또는 환불된 건은 실패 처리하지 않습니다. (merchantId={})", merchantId);
            return;
        }

        // 결제 실패 처리 (검증 실패, 사용자 취소, PG 오류 등)
        master.markAsFailed(reason);
        paymentRepository.save(master);

        log.warn("결제 실패 처리 완료 - merchantId={}, reason={}", merchantId, reason);
    }

    // 5. 환불 요청 및 상태 변경
    @Override
    @Transactional
    public void refundPayment(String merchantId, BigDecimal refundAmount, String reason) throws IamportResponseException, IOException {
        log.info("환불 요청 수신 - merchantId={}, refundAmount={}, reason={}",
                merchantId, refundAmount, reason);

        // 결제 마스터 조회
        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("해당 결제 ID에 대한 내역이 존재하지 않습니다."));

        // 환불 가능한 상태인지 검증
        if (master.getPaymentStatus() != PaymentStatus.PAID
                && master.getPaymentStatus() != PaymentStatus.PARTIAL_REFUNDED) {
            throw new IllegalStateException("환불할 수 없는 결제 상태입니다. (현재 상태: " + master.getPaymentStatus() + ")");
        }

        // 환불 대상 상세 조회
        List<PaymentDetail> details = paymentDetailRepository.findAllByMerchantId(merchantId);
        if (details.isEmpty()) {
            throw new IllegalStateException("결제 상세 내역이 존재하지 않습니다. (merchantId=" + merchantId + ")");
        }

        // 환불 금액 계산
        BigDecimal totalRefund = BigDecimal.ZERO;
        for (PaymentDetail detail : details) {
            // 이미 환불된 건은 건너뛴다
            if (detail.getPaymentStatus() == PaymentStatus.REFUNDED) continue;

            BigDecimal itemAmount = detail.getAmount() != null ? detail.getAmount() : BigDecimal.ZERO;
            totalRefund = totalRefund.add(itemAmount);

            detail.markAsRefunded(reason);
        }

        // 환불 총액 갱신
        master.markAsRefunded(totalRefund);
        paymentRepository.save(master);

        // 포트원 서버에도 환불 요청 (※ 실제 운영에서는 impUid 필요)
        IamportResponse<Payment> cancelResponse =
                iamportClient.cancelPaymentByImpUid(new com.siot.IamportRestClient.request.CancelData(
                        master.getImpUid(),   // PG 승인번호
                        true,                 // 전액 환불
                        refundAmount          // 환불 금액
                ));

        if (cancelResponse == null || cancelResponse.getResponse() == null) {
            throw new IllegalStateException("포트원 환불 요청 실패 (impUid=" + master.getImpUid() + ")");
        }

        log.info("환불 처리 완료 - merchantId={}, refundAmount={}, reason={}",
                merchantId, totalRefund, reason);
    }


}
