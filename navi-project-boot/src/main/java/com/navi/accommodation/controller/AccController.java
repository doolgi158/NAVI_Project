package com.navi.accommodation.controller;

import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.service.AccService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/accommodation")
public class AccController {
    private final AccService accService;

    /* === API 데이터 적재 === */
    @GetMapping("/api/load")
    public String loadAccData() throws Exception {
        accService.loadFromJsonFile();
        return "숙소 1차 데이터 로드 완료!";
    }
    @PostMapping("/api/update")
    public String updateAccData() throws Exception {
        accService.updateFromJsonFile();
        return "숙소 세부 업데이트 완료!";
    }

    /* === CREATE === */
    @PostMapping("/create")
    public String createAccData(@RequestBody AccRequestDTO dto) {
        accService.createAcc(dto);
        return "숙소 생성 완료!";
    }

    /* === UPDATE === */
    @PutMapping("/update/{accNo}")
    public String updateAccData(@PathVariable Long accNo, @RequestBody AccRequestDTO dto){
        accService.updateAcc(accNo, dto);
        return "숙소 수정 완료!";
    }

    /* === DELETE === */
    @DeleteMapping("/delete/{accNo}")
    public String deleteAccData(@PathVariable Long accNo){
        accService.deleteAcc(accNo);
        return "숙소 삭제 완료!";
    }
}
