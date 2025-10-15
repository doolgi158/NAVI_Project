//package com.navi.accommodation.service;
//
//import com.navi.accommodation.domain.AccRsv;
//import com.navi.accommodation.dto.request.AccRsvRequestDTO;
//import com.navi.reservation.repository.RsvRepository;
//import com.navi.room.domain.Room;
//import com.navi.accommodation.dto.response.AccRsvResponseDTO;
//import com.navi.room.repository.RoomRepository;
//import com.navi.reservation.domain.Rsv;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//@Transactional(readOnly = true)
//public class AccRsvServiceImpl implements AccRsvService {
//    private  final RsvRepository rsvRepository;
//    private final AccRsvRepository accRsvRepository;
//    private final RoomRepository roomRepository;
//
//    /* === 숙소 상세 예약 생성 === */
//    @Override
//    @Transactional
//    public void createAccReservation(AccRsvRequestDTO dto) {
//        log.info("[AccRsvService] 숙소 상세 예약 생성 요청 → reserveId={}, roomId={}", dto.getReserveId(), dto.getRoomId());
//
//        // 1️⃣ 예약 마스터 조회
//        Rsv rsv = rsvRepository.findByReserveId(dto.getReserveId())
//                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다: " + dto.getReserveId()));
//
//        // 2️⃣ 객실 정보 조회
//        Room room = roomRepository.findByRoomId(dto.getRoomId())
//                .orElseThrow(() -> new IllegalArgumentException("객실 정보를 찾을 수 없습니다: " + dto.getRoomId()));
//
//        // 3️⃣ 상세 예약 엔티티 생성
//        AccRsv accRsv = AccRsv.builder()
//                .rsv(rsv)
//                .room(room)
//                .quantity(dto.getQuantity())
//                .roomPrice(dto.getRoomPrice())
//                .totalAmount(dto.getTotalAmount())
//                .startDate(dto.getStartDate())
//                .endDate(dto.getEndDate())
//                .build();
//
//        // 4️⃣ 저장
//        accRsvRepository.save(accRsv);
//
//        log.info("[AccRsvService] 숙소 상세 예약 생성 완료 → detailId={}, 기간:{}~{}, 총금액={}",
//                accRsv.getDetailId(), dto.getStartDate(), dto.getEndDate(), dto.getTotalAmount());
//    }
//
//    /** === 전체 예약 상세 목록 조회 === */
//    @Override
//    public List<AccRsvResponseDTO> findAllDetails() {
//        return accRsvRepository.findAllDetails()
//                .stream()
//                .map(AccRsvResponseDTO::fromEntity)
//                .collect(Collectors.toList());
//    }
//
//    /** === 사용자 ID 기준 예약 목록 조회 === */
//    @Override
//    public List<AccRsvResponseDTO> findAllByUserNo(Long userNo) {
//        return accRsvRepository.findAllByUserNo(userNo)
//                .stream()
//                .map(AccRsvResponseDTO::fromEntity)
//                .collect(Collectors.toList());
//    }
//
//    /** === 예약 ID 기준 숙소 상세 예약 조회 === */
//    @Override
//    public List<AccRsvResponseDTO> findAllByReserveId(String reserveId) {
//        return accRsvRepository.findAllByReserveId(reserveId)
//                .stream()
//                .map(AccRsvResponseDTO::fromEntity)
//                .collect(Collectors.toList());
//    }
//
//    /** === 체크인 날짜 조회 === */
//    @Override
//    public LocalDate findCheckInDateByReserveId(String reserveId) {
//        LocalDate date = accRsvRepository.findCheckInDateByReserveId(reserveId);
//        if (date == null) {
//            throw new IllegalArgumentException("해당 예약의 체크인 날짜를 찾을 수 없습니다.");
//        }
//        return date;
//    }
//}