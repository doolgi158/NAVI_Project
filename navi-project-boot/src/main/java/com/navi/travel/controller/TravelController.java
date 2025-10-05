package com.navi.travel.controller;

import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.service.TravelService; // TravelApiService 대신 TravelService 인터페이스 사용
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
public class TravelController {
    // TravelApiService 대신 TravelService 인터페이스 사용
    private final TravelService travelApiService;

    // 제주도 여행정보 리스트 화면 (페이지네이션 적용)
    // TravelListResponseDTO<TravelApiItemDTO> 제네릭 사용 대신 Page<TravelListResponseDTO> 사용
    @GetMapping("/list")
    public Page<TravelListResponseDTO> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 클라이언트의 요청 페이지는 1부터 시작하지만, Spring Data JPA의 Pageable은 0부터 시작하므로 page - 1
        PageRequest pageable = PageRequest.of(page - 1, size);

        // Service를 통해 DB에서 데이터를 가져와 반환
        return travelApiService.getTravelList(pageable);
    }


    @PostMapping("/load_save")
    public String load_save() {
        try{
            // 서비스의 api 데이터 저장 메서드 호출
            int count = travelApiService.saveApiData();
            return "API 데이터 저장 완료 총 "+count+" 건 처리됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "API 데이터 저장 중 오류 발생: "+ e.getMessage();
        }
    }

}