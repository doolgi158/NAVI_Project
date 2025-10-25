package com.navi.accommodation.controller;

import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.service.AccService;
import com.navi.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
public class AccUserController {
    private final AccService accService;
    private final RoomService roomService;

    /* === 숙소 리스트 조회 === */
    @GetMapping("/accommodations")
    public ResponseEntity<List<AccListResponseDTO>> getAccommodationList(@ModelAttribute AccSearchRequestDTO dto) {
        log.info("[USER] 숙소 리스트 조회 요청 - 조건: {}", dto);
        List<AccListResponseDTO> result = accService.searchAccommodations(dto);
        return ResponseEntity.ok(result);
    }

    /* 추가: /stay/list 도 동일한 응답을 반환하도록 (호환용) */
    @GetMapping("/stay/list")
    public ResponseEntity<List<AccListResponseDTO>> getStayList() {
        List<AccListResponseDTO> list = accService.getAllAcc().stream()
                .map(AccListResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(list);
    }

    /* === 숙소 상세 조회 === */
    @GetMapping("/accommodations/{accId}")
    public AccDetailResponseDTO getAccommodationDetail(@PathVariable String accId) {
        log.info("[USER] 숙소 상세 조회 요청 - accId: {}", accId);
        return accService.getAccDetail(accId);
    }

}