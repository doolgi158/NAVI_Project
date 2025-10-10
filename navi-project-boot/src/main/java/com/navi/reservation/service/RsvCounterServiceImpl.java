//package com.navi.reservation.service;
//
//import com.navi.reservation.domain.RsvCounter;
//import com.navi.reservation.repository.RsvCounterRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//
//@Service
//@RequiredArgsConstructor
//public class RsvCounterServiceImpl implements RsvCounterService{
//    private final RsvCounterRepository counterRepository;
//
//    @Override
//    @Transactional // 하나의 트랜잭션 단위로 묶어서 처리(전부 성공하면 commit, 하나라도 실패하면 rollback)
//    public String generatedReserveId(String targetType) {
//        String today = LocalDateTime.now().format(DateTimeFormatter.BASIC_ISO_DATE);
//
//        // 해당 날짜 + 유형 카운터 조회
//        RsvCounter counter = counterRepository.findByIdForUpdate(today, targetType)
//                .orElseGet(() -> {  // Optional 값이 없을 때 대체 행동 정의
//                    // 신규 생성
//                    RsvCounter newCounter = new RsvCounter(today, targetType, 1);
//                    counterRepository.save(newCounter);
//                    return newCounter;
//                });
//
//        // 시퀀스 증가 전 현재값 사용
//        int seq = counter.getNextSeq();
//        counter.increment();
//
//        // 예약번호 조합
//        return today + targetType + String.format("%03d", seq);
//    }
//}
