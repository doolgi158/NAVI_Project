package com.navi.accommodation.controller;

import com.navi.accommodation.service.AccService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AccController {
    private final AccService accService;

    @GetMapping("/api/accommodation/load")
    public String loadData() throws Exception {
        accService.loadFromJsonFile();
        return "숙소 데이터 로드 완료!";
    }
}
