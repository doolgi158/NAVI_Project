package com.navi.accommodation.service;

import com.navi.accommodation.dto.response.AccRsvResponseDTO;
import com.navi.accommodation.repository.AccRsvRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccRsvServiceImpl implements AccRsvService{
    private final AccRsvRepository accRsvRepository;

    @Override
    public List<AccRsvResponseDTO> findAllDetails() {
        return accRsvRepository.findAllDetails()
                .stream()
                .map(AccRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccRsvResponseDTO> findAllByUserNo(Long userNo) {
        return accRsvRepository.findAllByUserNo(userNo)
                .stream()
                .map(AccRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccRsvResponseDTO> findAllByReserveId(String reserveId) {
        return accRsvRepository.findAllByReserveId(reserveId)
                .stream()
                .map(AccRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public LocalDate findCheckInDateByReserveId(String reserveId) {
        LocalDate date = accRsvRepository.findCheckInDateByReserveId(reserveId);
        if(date == null) {
            throw new IllegalArgumentException("해당 예약의 체크인 날짜를 찾을 수 없습니다.");
        }
        return date;
    }
}
