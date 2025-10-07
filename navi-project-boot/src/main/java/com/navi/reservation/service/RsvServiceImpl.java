package com.navi.reservation.service;

import com.navi.reservation.domain.Rsv;
import com.navi.reservation.domain.RsvCounter;
import com.navi.reservation.dto.request.RsvConfirmRequestDTO;
import com.navi.reservation.dto.request.RsvPreRequestDTO;
import com.navi.reservation.dto.response.RsvResponseDTO;
import com.navi.reservation.repository.RsvRepository;
import com.navi.reservation.repository.RsvCounterRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RsvServiceImpl implements RsvService {
    private final RsvRepository rsvRepository;
    private final RsvCounterService counterService;
    private final UserRepository userRepository;

    /** === 관리자 기능 === */
    @Override
    public List<Rsv> findAllRsv() {
        return rsvRepository.findAll();
    }

    @Override
    public List<Rsv> findRsvByStatus(String status) {
        Rsv.PaymentStatus paymentStatus = Rsv.PaymentStatus.valueOf(status);
        return rsvRepository.findAllByPaymentStatus(paymentStatus);
    }

    /** === 사용자 기능 === */
    @Override
    @Transactional  // 하나의 트랜잭션 단위로 묶어서 처리(전부 성공하면 commit, 하나라도 실패하면 rollback)
    public Rsv confirmRsv(RsvConfirmRequestDTO dto) {
        // 예약번호 생성
        String reserveId = counterService.generatedReserveId(dto.getTargetType().name());

        // 회원정보 조회 -> 나중에 수정해야 함 (이미 로그인도이ㅓ있는 상황일것 같은데...)
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 예약 엔티티 생성
        Rsv rsv = Rsv.builder()
                .reserveId(reserveId)
                .userNo(user)
                .targetType(dto.getTargetType())
                .targetId(dto.getTargetId())
                .paymentMethod(dto.getPaymentMethod())
                .totalAmount(dto.getTotalAmount())
                .build();

        // 결제 상태 변경 로직
        try {
            // 나중에 PaymentClient.verifyPayment(dto.getPaymentId()) 연동 가능
            rsv.markAsPaid(dto.getPaymentId(), dto.getPaymentMethod());
        } catch (Exception e) {
            // 결제 중 문제 발생 시 예외 처리
            rsv.markAsFailed(e.getMessage());
        }
        return rsvRepository.save(rsv);
    }

    @Override
    public List<Rsv> findAllByUserNo(Long userNo) {
        // 특정 회원의 모든 예약 목록 조회
        return rsvRepository.findAllByUser(userNo);
    }
}
