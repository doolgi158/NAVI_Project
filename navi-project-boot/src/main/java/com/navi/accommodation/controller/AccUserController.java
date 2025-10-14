package com.navi.accommodation.controller;

import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.accommodation.service.AccService;
import com.navi.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /* === 숙소 상세 조회 === */
    @GetMapping("/accommodations/{accId}")
    public AccDetailResponseDTO getAccommodationDetail(@PathVariable String accId) {
        log.info("[USER] 숙소 상세 조회 요청 - accId: {}", accId);
        return accService.getAccDetail(accId);
    }

}
