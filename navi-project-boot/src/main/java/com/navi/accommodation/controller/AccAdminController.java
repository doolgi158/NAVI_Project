package com.navi.accommodation.controller;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.service.AccService;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class AccAdminController {
    private final AccService accService;

    // === CREATE ===
    @PostMapping("/accommodations")
    public ApiResponse<?> createAccData(@RequestBody AccRequestDTO dto) {
        return ApiResponse.success(accService.createAcc(dto));
    }

    // === READ (전체 조회) ===
    @GetMapping
    public ApiResponse<?> getAllAcc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        Page<Acc> result = accService.getAdminAccList(PageRequest.of(page, size), keyword);
        return ApiResponse.success(result);
    }

    // === READ (단건 조회) ===
    @GetMapping("/{accNo}")
    public ApiResponse<?> getAccDetail(@PathVariable Long accNo) {
        AccDetailResponseDTO detail = accService.getAccDetailByNo(accNo);
        return ApiResponse.success(detail);
    }

    // === UPDATE ===
    @PutMapping("/accommodations/{accNo}")
    public ApiResponse<?> updateAccData(@PathVariable Long accNo, @RequestBody AccRequestDTO dto) {
        return ApiResponse.success(accService.updateAcc(accNo, dto));
    }

    // === DELETE ===
    @DeleteMapping("/accommodations/{accNo}")
    public ApiResponse<?> deleteAccData(@PathVariable Long accNo) {
        accService.deleteAcc(accNo);
        return ApiResponse.success("숙소 삭제 완료");
    }
}