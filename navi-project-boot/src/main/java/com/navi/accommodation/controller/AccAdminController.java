package com.navi.accommodation.controller;

import com.navi.accommodation.dto.api.AdminAccListDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.service.AccService;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class AccAdminController {
    private final AccService accService;

    // === CREATE ===
    @PostMapping("/accommodations/new")
    public ApiResponse<?> createAccData(@RequestBody AdminAccListDTO dto, @RequestPart(required = false) List<MultipartFile> images) {
        return ApiResponse.success(accService.createAcc(dto));
    }

    // === READ (전체 조회) ===
    @GetMapping("/accommodations")
    public ApiResponse<?> getAllAcc(@RequestParam(required = false) String keyword) {
        List<AdminAccListDTO> dtoList = accService.getAllAccList(keyword);
        return ApiResponse.success(dtoList);
    }

    // === READ (단건 조회) ===
    @GetMapping("/accommodations/edit/{accNo}")
    public ApiResponse<?> getAccDetail(@PathVariable Long accNo) {
        AccDetailResponseDTO detail = accService.getAccDetailByNo(accNo);
        return ApiResponse.success(detail);
    }

    // === UPDATE ===
    @PutMapping("/accommodations/edit/{accNo}")
    public ApiResponse<?> updateAccData(@PathVariable Long accNo, @RequestBody AccRequestDTO dto) {
        return ApiResponse.success(AdminAccListDTO.fromEntity(accService.updateAcc(accNo, dto)));
    }

    // === DELETE ===
    @DeleteMapping("/accommodations/{accNo}")
    public ApiResponse<?> deleteAccData(@PathVariable Long accNo) {
        accService.deleteAcc(accNo);
        return ApiResponse.success("숙소 삭제 완료");
    }
}