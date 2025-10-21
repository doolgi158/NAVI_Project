package com.navi.room.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.room.dto.api.RoomApiDTO;
import com.navi.room.dto.request.RoomRequestDTO;
import com.navi.room.dto.response.RoomResponseDTO;
import com.navi.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class RoomAdminController {
    private final RoomService roomService;

    @GetMapping("/rooms")
    public ApiResponse<?> getRoomList(
            @RequestParam Long accNo,
            @RequestParam(required = false) String keyword
    ) {
        List<RoomApiDTO> list = roomService.getRoomListByAcc(accNo, keyword);
        return ApiResponse.success(list);
    }

    @PostMapping("/rooms/new")
    public ApiResponse<RoomResponseDTO> createRoom(@RequestBody RoomRequestDTO dto) {
        return ApiResponse.success(roomService.createRoom(dto));
    }

    @PutMapping("/rooms/edit/{roomNo}")
    public ApiResponse<RoomResponseDTO> updateRoom(
            @PathVariable Long roomNo,
            @RequestBody RoomRequestDTO dto) {
        return ApiResponse.success(roomService.updateRoom(roomNo, dto));
    }

    @DeleteMapping("/rooms/{roomNo}")
    public ApiResponse<String> deleteRoom(@PathVariable Long roomNo) {
        roomService.deleteRoom(roomNo);
        return ApiResponse.success("객실이 삭제되었습니다.");
    }

    @GetMapping("/rooms/byAcc/{accNo}")
    public ApiResponse<List<RoomResponseDTO>> getRoomsByAcc(@PathVariable Long accNo) {
        return ApiResponse.success(roomService.getRoomsByAcc(accNo));
    }

    @GetMapping("/rooms/{roomNo}")
    public ApiResponse<RoomResponseDTO> getRoomDetail(@PathVariable Long roomNo) {
        return ApiResponse.success(roomService.getRooms(roomNo));
    }
}
