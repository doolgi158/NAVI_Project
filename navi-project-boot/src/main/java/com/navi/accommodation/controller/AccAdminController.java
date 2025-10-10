package com.navi.accommodation.controller;

import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.service.AccService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AccAdminController {
    private final AccService accService;

    /** === CREATE === */
    @PostMapping("/accommodations")
    public String createAccData(@RequestBody AccRequestDTO dto) {
        accService.createAcc(dto);
        return "숙소 생성 완료!";
    }

    /** === UPDATE === */
    @PutMapping("/accommodations/{accNo}")
    public String updateAccData(@PathVariable Long accNo, @RequestBody AccRequestDTO dto){
        accService.updateAcc(accNo, dto);
        return "숙소 수정 완료!";
    }

    /** === DELETE === */
    @DeleteMapping("/accommodations/{accNo}")
    public String deleteAccData(@PathVariable Long accNo){
        accService.deleteAcc(accNo);
        return "숙소 삭제 완료!";
    }
}