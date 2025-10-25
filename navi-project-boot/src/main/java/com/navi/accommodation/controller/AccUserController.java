package com.navi.accommodation.controller;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.service.AccService;
import com.navi.common.response.ApiResponse;
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
    public List<AccListResponseDTO> getAccommodationList(@ModelAttribute AccSearchRequestDTO dto) {
        log.info("[USER] 숙소 리스트 조회 요청 - 조건: {}", dto);
        return accService.searchAccommodations(dto);
    }

    /* 추가: /stay/list 도 동일한 응답을 반환하도록 (호환용) */
    @GetMapping("/stay/list")
    public ResponseEntity<List<AccListResponseDTO>> getStayList(@ModelAttribute AccSearchRequestDTO dto) {
        return ResponseEntity.ok(getAccommodationList(dto));
    }

    /* === 숙소 상세 조회 === */
    @GetMapping("/accommodations/{accId}")
    public AccDetailResponseDTO getAccommodationDetail(@PathVariable String accId) {
        log.info("[USER] 숙소 상세 조회 요청 - accId: {}", accId);
        return accService.getAccDetail(accId);
    }

    @PatchMapping("/accommodations/view/{accId}")
    public ResponseEntity<ApiResponse<AccListResponseDTO>> increaseViewCount(@PathVariable String accId) {
        log.info("👁️ [USER] 숙소 조회수 증가 요청 - accId: {}", accId);
        Acc updated = accService.increaseViewCount(accId);

        return ResponseEntity.ok(ApiResponse.success(AccListResponseDTO.fromEntity(updated)));
    }
}