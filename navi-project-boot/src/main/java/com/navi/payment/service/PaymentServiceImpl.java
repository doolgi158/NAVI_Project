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
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final IamportClient iamportClient; // PortOne(아임포트) API 클라이언트
    private final PaymentRepository paymentRepository;
    private final PaymentDetailRepository paymentDetailRepository;

    /* 결제 준비 */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)  // ✅ 트랜잭션 분리
    public PaymentPrepareResponseDTO preparePayment(PaymentPrepareRequestDTO dto) {

        // 1️⃣ Oracle 시퀀스 직접 조회
        Long nextSeq = paymentRepository.getNextSeqVal();

        // 2️⃣ merchantId 생성
        String today = LocalDate.now(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.BASIC_ISO_DATE);
        String merchantId = String.format("PAY%s-%04d", today, nextSeq);

        // 3️⃣ 엔티티 생성 (ID, merchantId 모두 세팅 후 저장)
        PaymentMaster payment = PaymentMaster.builder()
                .no(nextSeq)
                .merchantId(merchantId)
                .totalAmount(dto.getTotalAmount())
                .paymentMethod(dto.getPaymentMethod())
                .paymentStatus(PaymentStatus.READY)
                .build();

        paymentRepository.save(payment); // ✅ 1회만 save, 절대 중복 X

        log.info("✅ [결제 준비 완료] merchantId={}, totalAmount={}", merchantId, dto.getTotalAmount());
        return PaymentPrepareResponseDTO.builder()
                .merchantId(merchantId)
                .build();
    }

    /* 포트원 결제 검증 */
    @Override
    @Transactional(readOnly = true)
    public PaymentVerifyResponseDTO verifyPayment(PaymentVerifyRequestDTO dto)
            throws IamportResponseException, IOException {

        log.info("🟦 [결제 검증 요청] impUid={}, merchantId={}", dto.getImpUid(), dto.getMerchantId());

        // 1️⃣ PortOne 서버에 결제 정보 요청
        IamportResponse<Payment> response = iamportClient.paymentByImpUid(dto.getImpUid());
        Payment paymentInfo = response.getResponse();

        if (paymentInfo == null) {
            log.error("❌ PortOne 응답이 비어 있음 - impUid={}", dto.getImpUid());
            return PaymentVerifyResponseDTO.builder()
                    .success(false)
                    .message("PortOne 결제 정보 조회 실패")
                    .build();
        }

        // 2️⃣ PortOne 결제 상태 확인 (PG 서버 기준)
        boolean validStatus = "paid".equalsIgnoreCase(paymentInfo.getStatus());

        // 3️⃣ 서버 검증 결과 로그
        log.info("🔍 [PG 검증 결과] impUid={}, status={}, amount={}, merchantId={}",
                paymentInfo.getImpUid(),
                paymentInfo.getStatus(),
                paymentInfo.getAmount(),
                paymentInfo.getMerchantUid());

        // 4️⃣ PortOne 서버 상태만 검증 (금액 검증은 도메인 서비스에서 수행)
        return PaymentVerifyResponseDTO.builder()
                .success(validStatus)
                .impUid(paymentInfo.getImpUid())
                .merchantId(paymentInfo.getMerchantUid())
                .build();
    }

    /* 결제 확정 */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto) {
        log.info("💰 [결제 확정 요청] merchantId={}, rsvType={}, items={}",
                dto.getMerchantId(), dto.getRsvType(), dto.getItems());

        // 1️⃣ 결제 마스터 조회
        PaymentMaster master = paymentRepository.findByMerchantId(dto.getMerchantId())
                .orElseThrow(() -> new IllegalArgumentException("결제 정보가 존재하지 않습니다."));

        if (master.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("이미 결제 완료된 건입니다.");
        }

        // 2️⃣ 상태 갱신 (DB에 저장된 결제수단 그대로 사용)
        master.markAsPaid(dto.getImpUid(), master.getPaymentMethod());

        // 3️⃣ 상세 내역 생성
        BigDecimal total = BigDecimal.ZERO;
        for (PaymentConfirmRequestDTO.ReservePaymentItem item : dto.getItems()) {
            PaymentDetail detail = PaymentDetail.builder()
                    .paymentMaster(master)
                    .rsvType(dto.getRsvType())
                    .reserveId(item.getReserveId())
                    .amount(item.getAmount())
                    .build();

            master.addPaymentDetail(detail);
            total = total.add(item.getAmount());
        }

        // 4️⃣ 총액 갱신 + 저장
        master.updateTotalAmount(total);
        paymentRepository.save(master);

        log.info("✅ [결제 확정 완료] merchantId={}, totalAmount={}", master.getMerchantId(), total);

        return PaymentConfirmResponseDTO.builder()
                .merchantId(master.getMerchantId())
                .reserveIds(dto.getItems().stream()
                        .map(PaymentConfirmRequestDTO.ReservePaymentItem::getReserveId)
                        .toList())
                .rsvStatus(RsvStatus.PAID)
                .build();
    }


    /* 결제 실패 처리 (자동 환불 포함) */
    @Override
    @Transactional
    public void failPayment(String merchantId, String reason) {
        log.warn("⚠️ [결제 실패 처리 요청] merchantId={}, reason={}", merchantId, reason);

        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("결제 내역이 존재하지 않습니다."));

        if (master.getPaymentStatus() == PaymentStatus.PAID ||
                master.getPaymentStatus() == PaymentStatus.REFUNDED) {
            log.info("⛔ 이미 결제 완료/환불된 건은 실패 처리 불가");
            return;
        }

        try {
            // ✅ PortOne에 결제 정보 조회
            IamportResponse<Payment> response = iamportClient.paymentByImpUid(master.getImpUid());
            Payment paymentInfo = response.getResponse();

            // ✅ 이미 결제된 경우에만 환불 시도
            if (paymentInfo != null && "paid".equalsIgnoreCase(paymentInfo.getStatus())) {
                BigDecimal actualPaidAmount = paymentInfo.getAmount();
                log.info("💸 [자동 환불 시도] impUid={}, amount={}", master.getImpUid(), actualPaidAmount);

                refundPayment(merchantId, actualPaidAmount, "자동 환불 - " + reason);
            }
        } catch (Exception e) {
            log.error("❌ [자동 환불 중 오류 발생] merchantId={}, msg={}", merchantId, e.getMessage());
        }

        // 🔁 DB 상태를 FAILED로 전환 (환불 후에도 실패로 기록)
        master.markAsFailed(reason);
        paymentRepository.save(master);

        log.warn("❌ [결제 실패 처리 완료] merchantId={}, reason={}", merchantId, reason);
    }

    /* 환불 요청 및 상태 변경 */
    @Override
    @Transactional
    public void refundPayment(String merchantId, BigDecimal refundAmount, String reason)
            throws IamportResponseException, IOException {

        log.info("↩️ [환불 요청 수신] merchantId={}, refundAmount={}, reason={}",
                merchantId, refundAmount, reason);

        PaymentMaster master = paymentRepository.findByMerchantId(merchantId)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

        if (master.getPaymentStatus() != PaymentStatus.PAID &&
                master.getPaymentStatus() != PaymentStatus.PARTIAL_REFUNDED) {
            throw new IllegalStateException("환불할 수 없는 상태입니다. 현재 상태=" + master.getPaymentStatus());
        }

        // ✅ 실제 결제 금액을 PortOne 서버에서 다시 확인
        IamportResponse<Payment> paymentResponse = iamportClient.paymentByImpUid(master.getImpUid());
        Payment paymentInfo = paymentResponse.getResponse();

        BigDecimal actualAmount = (paymentInfo != null && paymentInfo.getAmount() != null)
                ? paymentInfo.getAmount() : refundAmount;

        // ✅ PG 서버에 환불 요청
        IamportResponse<Payment> cancelResponse =
                iamportClient.cancelPaymentByImpUid(new CancelData(master.getImpUid(), true, actualAmount));

        if (cancelResponse == null || cancelResponse.getResponse() == null) {
            throw new IllegalStateException("포트원 환불 요청 실패 (impUid=" + master.getImpUid() + ")");
        }

        // ✅ DB 상태 동기화
        List<PaymentDetail> details = paymentDetailRepository.findAllByPaymentMasterMerchantId(merchantId);
        if (!details.isEmpty()) {
            details.forEach(detail -> detail.markAsRefunded(reason));
        }

        master.markAsRefunded(actualAmount);
        paymentRepository.save(master);

        log.info("✅ [환불 처리 완료] merchantId={}, refundAmount={}", merchantId, actualAmount);
    }
}
