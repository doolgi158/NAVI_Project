package com.navi.accommodation.controller;

import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.service.AccService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AccController {
    private final AccService accService;

    /* === API 데이터 적재 === */
    @GetMapping("/initData")
    public String loadAccData() throws Exception {
        accService.loadFromJsonFile();
        return "숙소 1차 데이터 로드 완료!";
    }
    @PostMapping("/initData")
    public String updateAccData() throws Exception {
        accService.updateFromJsonFile();
        return "숙소 세부 업데이트 완료!";
    }

    /* === CREATE === */
    @PostMapping("/accommodations")
    public String createAccData(@RequestBody AccRequestDTO dto) {
        accService.createAcc(dto);
        return "숙소 생성 완료!";
    }

    /* === UPDATE === */
    @PutMapping("/accommodations/{accNo}")
    public String updateAccData(@PathVariable Long accNo, @RequestBody AccRequestDTO dto){
        accService.updateAcc(accNo, dto);
        return "숙소 수정 완료!";
    }

    /* === DELETE === */
    @DeleteMapping("/accommodations/{accNo}")
    public String deleteAccData(@PathVariable Long accNo){
        accService.deleteAcc(accNo);
        return "숙소 삭제 완료!";
    }
}
