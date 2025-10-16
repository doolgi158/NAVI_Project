package com.navi.accommodation.service;

import com.navi.accommodation.domain.AccRsv;
import com.navi.accommodation.dto.request.AccRsvRequestDTO;
import com.navi.accommodation.mapper.AccRsvMapper;
import com.navi.accommodation.dto.response.AccRsvResponseDTO;
import com.navi.room.domain.Room;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AccRsvServiceImpl implements AccRsvService {
    private final AccRsvMapper accRsvMapper;
    private final RoomRepository roomRepository;

    /* == [비즈니스 로직용] == */
    // 1. 수수료 계산 시 필요한 체크인 날짜
    @Override
    public LocalDate findCheckInDateByArsvId(String arsvId) {
        return accRsvMapper.findCheckInDateByArsvId(arsvId);
    }

    /* == 관리자용 == */
    // 1. 전체 숙소 예약 목록 조회
    @Override
    public List<AccRsvResponseDTO> getAllReservations() {
        return accRsvMapper.findAllRsv().stream()
                .map(AccRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 2. 숙소별 예약 목록 조회
    @Override
    public List<AccRsv> getRsvByAccId(String accId) {
        return accRsvMapper.findByAccId(accId);
    }

    // 2. 특정 숙소의 하루 단위 예약 수 조회
    @Override
    public int getRsvCountByAccIdAndDate(String accId, LocalDate targetDate) {
        return accRsvMapper.countByAccIdAndDate(accId, targetDate);
    }

    /* == 사용자용 == */
    // 1. 사용자 ID별 숙소 예약 목록 조회
    @Override
    public List<AccRsvResponseDTO> findAllByUserId(String userId) {
        return accRsvMapper.findAllByUserId(userId).stream()
                .map(AccRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
    // 2. 예약 ID 기준 숙소 상세 예약 목록 조회
    @Override
    public List<AccRsvResponseDTO> findAllByArsvId(String arsvId) {
        return accRsvMapper.findAllByArsvId(arsvId).stream()
                .map(AccRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }


}
