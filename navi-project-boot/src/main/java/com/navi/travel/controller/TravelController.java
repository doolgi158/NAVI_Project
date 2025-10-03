package com.navi.travel.controller;

import com.navi.travel.dto.ListResponseDTO;
import com.navi.travel.dto.TravelApiItemDTO;
import com.navi.travel.dto.TravelListDTO;
import com.navi.travel.service.TravelApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
public class TravelController {
    private final TravelApiService travelApiService;

    //제주도 여행정보 리스트 화면
    @GetMapping("/list")
    public TravelListDTO <TravelApiItemDTO> list(TravelListDTO travelListDTO) {
        return travelApiService.list(TravelListDTO);
    }

    public ListResponseDTO<TravelApiItemDTO> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Service를 통해 DB에서 데이터를 가져와 반환
        return travelApiService.getList(page, size);
    }


    @PostMapping("/load_save")
    public String load_save() {
        try{
            //서비스의 api 데이터 저장 메서드 호출
            int count = travelApiService.saveApiData();
            return "API 데이터 저장 완료 총 "+count+" 건 처리됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "API 데이터 저장 중 오류 발생: "+ e.getMessage();
        }
    }

}
