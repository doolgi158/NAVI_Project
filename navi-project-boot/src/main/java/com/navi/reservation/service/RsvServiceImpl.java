//package com.navi.reservation.service;
//
//import com.navi.reservation.domain.Rsv;
//import com.navi.reservation.dto.request.RsvRequestDTO;
//import com.navi.reservation.dto.response.RsvResponseDTO;
//import com.navi.reservation.repository.RsvCounterRepository;
//import com.navi.reservation.repository.RsvRepository;
//import com.navi.user.domain.User;
//import com.navi.user.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//@RequiredArgsConstructor
//public class RsvServiceImpl implements RsvService{
//    /*
//    private final RsvRepository rsvRepository;
//    private final RsvCounterRepository counterRepository;
//    private final UserRepository userRepository;
//
//    @Override
//    @Transactional
//    public RsvResponseDTO processPayment(RsvRequestDTO dto) {
//        // 예약 ID 생성
//        String reserveId = generateReserveId(dto.getTargetType().name());
//
//        // 사용자 조회
//        User user = userRepository.findById(dto.getUserNo())
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
//
//        // 예약 저장(결제대기)
//        Rsv rsv = Rsv.builder()
//                .reserveId(reserveId)
//                .userNo(user)
//                .targetType(dto.getTargetType())
//                .targetId(dto.getTargetId())
//                .paymentStatus(Rsv.PaymentStatus.결제대기)
//                .paymentMethod(dto.getPaymentMethod())
//                .totalAmount(dto.getTotalAmount())
//                .build();
//
//        rsvRepository.save(rsv);
//
//        // 외부 결제 요청
//        PaymentClient.PaymentResult result =
//                paymentClient.requestPayment(dto.getPaymentMethod(), dto.getTotalAmount());
//
//        // 5️⃣ 결제 결과 반영
//        if (result.isSuccess()) {
//            rsv.markAsPaid(result.getPaymentId(), dto.getPaymentMethod());
//        } else {
//            rsv.markAsFailed(result.getFailReason());
//        }
//
//        // 6️⃣ 최종 저장
//        rsvRepository.save(rsv);
//
//        // 7️⃣ 응답 DTO 변환
//        return RsvResponseDTO.fromEntity(rsv);
//    }
//
//    /** 예약 ID 생성 로직 (YYYYMMDD+TYPE+SEQ) *
//    @Transactional
//    public String generateReserveId(String targetType) {
//        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
//
//        RsvCounter counter = counterRepository.findByIdForUpdate(date, targetType)
//                .orElseGet(() -> {
//                    RsvCounter newCounter = new RsvCounter(date, targetType, 0);
//                    counterRepository.save(newCounter);
//                    return newCounter;
//                });
//
//        counter.increment();
//        counterRepository.save(counter);
//
//        String seqPart = String.format("%03d", counter.getNextSeq());
//        return date + targetType + seqPart;
//    }*/
//}
