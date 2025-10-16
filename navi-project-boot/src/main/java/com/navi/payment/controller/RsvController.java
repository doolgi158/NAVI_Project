//package com.navi.reservation.controller;
//
//import com.navi.reservation.domain.Rsv;
//import com.navi.reservation.dto.request.RsvPreRequestDTO;
//import com.navi.reservation.dto.response.RsvResponseDTO;
//import com.navi.reservation.service.RsvService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.web.bind.annotation.*;
//
//@Slf4j
//@RestController
//@RequiredArgsConstructor
//@RequestMapping("/api/reservation")
//public class RsvController {
//    private final RsvService rsvService;
//
//    /* 결제 전 예약 정보 임시 생성(재고 선점용) */
//    @PostMapping("/pre")
//    public RsvResponseDTO createPendingRsv(@RequestBody RsvPreRequestDTO dto) {
//        Rsv rsv = rsvService.createPendingReservation(dto);
//        return RsvResponseDTO.fromEntity(rsv);
//    }
//}
