package com.navi.travel.controller;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.service.TravelService; // TravelApiService 대신 TravelService 인터페이스 사용
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
public class TravelController {
    private final TravelService travelService;


    // 제주도 여행정보 리스트 화면 (페이지네이션 적용)
    @GetMapping
    public Page<TravelListResponseDTO> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 클라이언트의 요청 페이지는 1부터 시작하지만, Spring Data JPA의 Pageable은 0부터 시작하므로 page - 1
        PageRequest pageable = PageRequest.of(page - 1, size);

        // Service를 통해 DB에서 데이터를 가져와 반환
        return travelService.getTravelList(pageable);
    }

    //상세내용 화면
    @GetMapping("/detail/{travelId}")
    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(@PathVariable("travelId") Long travelId) {
        try {

            //  서비스에서 상세 정보 DTO를 가져옵니다.
            TravelDetailResponseDTO detailDTO = travelService.getTravelDetail(travelId);

            return ResponseEntity.ok(detailDTO);

        } catch (NoSuchElementException e) {
            // ID에 해당하는 데이터가 없을 경우 404 Not Found 반환
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // 그 외 모든 예외에 대해 500 Internal Server Error 반환 (현재 발생한 에러 유형)
            // 💡 이전에 발생한 500 에러는 이 부분이 Catch 한 후 서버 로그에 자세한 예외가 남았을 것입니다.
            // 💡 정확한 에러 디버깅을 위해 서버 로그 확인이 필수적입니다.
            System.err.println("상세 정보 조회 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/views/{travelId}")
    public ResponseEntity<Void> incrementViews(@PathVariable("travelId") Long travelId) {
        try {
            travelService.incrementViews(travelId);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("조회수 증가 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/load_save")
    public String load_save() {
        try{
            // 서비스의 api 데이터 저장 메서드 호출
            int count = travelService.saveApiData();
            return "API 데이터 저장 완료 총 "+count+" 건 처리됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "API 데이터 저장 중 오류 발생: "+ e.getMessage();
        }
    }


}