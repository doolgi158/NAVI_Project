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
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class AccAdminController {
    private final AccService accService;

    /* 숙소 등록 */
    @PostMapping("/accommodations/new")
    public ApiResponse<?> createAccData(@RequestBody AdminAccListDTO dto, @RequestPart(required = false) List<MultipartFile> images) {
        return ApiResponse.success(accService.createAcc(dto));
    }

    /* 전체 조회 */
    @GetMapping("/accommodations")
    public ApiResponse<?> getAllAccList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer sourceType,    // 0: 자체, 1: TourAPI
            @RequestParam(required = false, defaultValue = "ALL") String activeFilter,   // ACTIVE / INACTIVE / ALL
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Map<String, Object> dtoList = accService.getAllAccList(keyword, sourceType, activeFilter, page, size);
        return ApiResponse.success(dtoList);
    }

    /* 단건 조회 */
    @GetMapping("/accommodations/edit/{accNo}")
    public ApiResponse<?> getAccDetail(@PathVariable Long accNo) {
        AccDetailResponseDTO detail = accService.getAccDetailByNo(accNo);
        return ApiResponse.success(detail);
    }

    /* 숙소 수정 */
    @PutMapping("/accommodations/edit/{accNo}")
    public ApiResponse<?> updateAccData(@PathVariable Long accNo, @RequestBody AccRequestDTO dto) {
        return ApiResponse.success(AdminAccListDTO.fromEntity(accService.updateAcc(accNo, dto)));
    }

    /* 숙소 삭제 */
    @DeleteMapping("/accommodations/{accNo}")
    public ApiResponse<?> deleteAccData(@PathVariable Long accNo) {
        accService.deleteAcc(accNo);
        return ApiResponse.success("숙소 삭제 완료");
    }
}