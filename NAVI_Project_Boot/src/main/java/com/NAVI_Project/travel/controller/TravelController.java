package com.NAVI_Project.travel.controller;

import com.NAVI_Project.travel.service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
public class TravelController {
    private final TravelService travelService;

    //제주도 여행정보 리스트 화면
    @GetMapping("/jejuSpotView")
    public String jejuSpotView(){
        return "travel/jejuSpotView";
    }

    @GetMapping(value = "/jejuSpotList",produces="application/json; charset=UTF-8")
    public String jejuSpotList() {
        return travelService.jejuSpotList();
    }

}
