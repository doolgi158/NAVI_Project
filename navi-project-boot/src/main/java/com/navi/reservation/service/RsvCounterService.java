package com.navi.reservation.service;

import com.navi.reservation.domain.RsvCounter;
import com.navi.reservation.domain.enums.RsvType;
import com.navi.reservation.repository.RsvCounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class RsvCounterService {
    private final RsvCounterRepository counterRepository;

    @Transactional // 하나의 트랜잭션 단위로 묶어서 처리(전부 성공하면 commit, 하나라도 실패하면 rollback)
    public String generateReserveId(RsvType rsvType) {
        String today = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);

        // 해당 날짜 + 유형 카운터 조회
        RsvCounter counter = counterRepository.findByKeyForUpdate(today, rsvType)
                .orElseGet(() -> {  // Optional 값이 없을 때 대체 행동 정의
                    // 신규 생성 시 nextSeq = 1 (생성자 내부에서 자동 설정됨)
                    RsvCounter newCounter = new RsvCounter(today, rsvType);
                    counterRepository.save(newCounter);
                    return newCounter;
                });

        // 시퀀스 증가 전 현재값 사용
        int seq = counter.getNextSeq();
        counter.increment();

        // 명시적 저장 (변경사항을 DB에 즉시 반영 - flush 시점 명확화)
        counterRepository.save(counter);
        return String.format("%s%s%03d", today, rsvType.name(), seq);    // 예약번호 조합
    }
}