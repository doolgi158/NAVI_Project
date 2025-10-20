package com.navi.room.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.room.dto.api.RoomApiDTO;
import com.navi.room.dto.request.RoomRequestDTO;
import com.navi.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ApiResponse<?> createRoom(@RequestBody RoomRequestDTO dto) {
        roomService.createRoom(dto);
        return ApiResponse.success("객실 등록 완료");
    }

    @PutMapping("/rooms/edit/{roomNo}")
    public ApiResponse<?> updateRoom(@PathVariable Long roomNo, @RequestBody RoomRequestDTO dto) {
        roomService.updateRoom(roomNo, dto);
        return ApiResponse.success("객실 수정 완료");
    }

    @DeleteMapping("/rooms/{roomNo}")
    public ApiResponse<?> deleteRoom(@PathVariable Long roomNo) {
        roomService.deleteRoom(roomNo);
        return ApiResponse.success("객실 삭제 완료");
    }
}
