package com.navi.accommodation.controller;

import com.navi.accommodation.dto.response.RoomListResponseDTO;
import com.navi.accommodation.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Slf4j
public class RoomUserController {
    private final RoomService roomService;

    @GetMapping("/{accId}")
    public List<RoomListResponseDTO> getRoomsByAccId(@PathVariable String accId) {
        log.info("[USER] 숙소별 객실 리스트 조회 - accId: {}", accId);
        return roomService.getRoomList(accId);
    }
}
