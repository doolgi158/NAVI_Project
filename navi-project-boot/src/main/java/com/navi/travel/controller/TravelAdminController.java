package com.navi.travel.controller;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRequestDTO;
import com.navi.travel.service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/adm")
@RequiredArgsConstructor
public class TravelAdminController {

    private final TravelService travelService;

    // --------------------------------------------------------------------
    //                 ✅ 관리자(Admin) API 영역 (CRUD 및 전체 목록 조회)
    // --------------------------------------------------------------------

    // 1. 여행지 관리 목록 조회 (READ - 관리자용: 모든 state 항목 조회)
    // 최종 경로: /adm/travel
//    @GetMapping("/travel")
//    // @Secured("ROLE_ADMIN") // 보안 적용 시
//    public Page<TravelListResponseDTO> getAdminList(
//            @PageableDefault(
//                    size = 10,
//                    sort = "travelId",
//                    direction = Sort.Direction.DESC
//            ) Pageable pageable,
//            @RequestParam(value = "search", required = false) String search
//    ) {
//        // 'publicOnly=false'를 전달하여 모든 상태 항목 조회 (TravelService 로직 재활용)
//        return travelService.getTravelList(pageable, null, null, search, false);
//    }

    // 2. 여행지 상세 조회 (READ - 단일 항목)
    // 최종 경로: /adm/travel/{travelId}
//    @GetMapping("/travel/detail/{travelId}")
//    // @Secured("ROLE_ADMIN")
//    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(@PathVariable Long travelId,String id) {
//        try {
//            TravelDetailResponseDTO detail = travelService.getTravelDetail(travelId,id);
//            return ResponseEntity.ok(detail);
//        } catch (NoSuchElementException e) {
//            // ID에 해당하는 여행지가 없을 경우 404 Not Found 반환
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            System.err.println("여행지 상세 조회 중 서버 오류 발생: " + e.getMessage());
//            // 기타 예상치 못한 오류 발생 시 500 Internal Server Error 반환
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }

    // 2. 여행지 등록/수정 (CREATE/UPDATE)
    // 최종 경로: /adm/travel
    @PostMapping("/travel")
    // @Secured("ROLE_ADMIN")
    public ResponseEntity<TravelListResponseDTO> saveOrUpdateTravel(@RequestBody TravelRequestDTO dto) {
        try {
            TravelListResponseDTO response = travelService.saveTravel(dto);

            // 등록(travelId가 null)이면 201 Created, 수정(travelId가 not null)이면 200 OK
            HttpStatus status = (dto.getTravelId() == null) ? HttpStatus.CREATED : HttpStatus.OK;

            return ResponseEntity.status(status).body(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("여행지 저장/수정 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 3. 여행지 삭제 (DELETE)
    // 최종 경로: /adm/travel/{travelId}
    @DeleteMapping("/travel/{travelId}")
    // @Secured("ROLE_ADMIN")
    public ResponseEntity<Void> deleteTravel(@PathVariable Long travelId) {
        try {
            travelService.deleteTravel(travelId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("여행지 삭제 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 4. API 데이터 저장 (관리자 기능, 필요하다면 여기에 유지)
    // 최종 경로: /adm/travel/load_save
    @PostMapping("/travel/load_save")
    public String load_save() {
        try {
            int count = travelService.saveApiData();
            return "API 데이터 저장 완료 총 " + count + " 건 처리됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "API 데이터 저장 중 오류 발생: " + e.getMessage();
        }
    }
}