package com.navi.accommodation.controller;

import com.navi.accommodation.service.AccService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/accommodation")
public class AccController {
    private final AccService accService;

    @GetMapping("/load")
    public String loadAccData() throws Exception {
        accService.loadFromJsonFile();
        return "숙소 1차 데이터 로드 완료!";
    }

    @PostMapping("/update")
    public String updateAccData() throws Exception {
        accService.updateFromJsonFile();
        return "숙소 세부 업데이트 완료!";
    }
}
