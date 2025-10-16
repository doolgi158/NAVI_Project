//package com.navi.travel.controller;
//
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.dto.TravelRequestDTO;
//import com.navi.travel.dto.admin.AdminTravelDetailResponseDTO;
//import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
//import com.navi.travel.service.AdminTravelService;
//import com.navi.travel.service.TravelService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.data.web.PageableDefault;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.annotation.Secured;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//import java.util.NoSuchElementException;
//
//@RestController
//@RequestMapping("/api/adm")
//@RequiredArgsConstructor
//public class TravelAdminController {
//
//    private final TravelService travelService;
//    private final AdminTravelService adminTravelService;
//
//    // --------------------------------------------------------------------
//    // ✅ 관리자(Admin) API (CRUD + 상태변경)
//    // --------------------------------------------------------------------
//
//    /** ✅ 1. 여행지 관리 목록 조회 */
//    @GetMapping("/travel")
//    public Page<AdminTravelListResponseDTO> getAdminList(
//            @PageableDefault(size = 10, sort = "travelId", direction = Sort.Direction.DESC)
//            Pageable pageable,
//            @RequestParam(value = "search", required = false) String search
//    ) {
//        return adminTravelService.getAdminTravelList(pageable, search);
//    }
//
//    /** ✅ 2. 여행지 상세 조회 (관리자용) */
//    @GetMapping("/travel/detail/{travelId}")
//    public ResponseEntity<AdminTravelDetailResponseDTO> getAdminTravelDetail(@PathVariable Long travelId) {
//        try {
//            AdminTravelDetailResponseDTO detail = adminTravelService.getAdminTravelDetail(travelId);
//            return ResponseEntity.ok(detail);
//        } catch (NoSuchElementException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            System.err.println("여행지 상세 조회 중 서버 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    /** ✅ 3. 여행지 등록 / 수정 */
//    @PostMapping("/travel")
//    @Secured("ROLE_ADMIN")
//    public ResponseEntity<TravelListResponseDTO> saveOrUpdateTravel(@RequestBody TravelRequestDTO dto) {
//        try {
//            TravelListResponseDTO response = travelService.saveTravel(dto);
//            HttpStatus status = (dto.getTravelId() == null) ? HttpStatus.CREATED : HttpStatus.OK;
//            return ResponseEntity.status(status).body(response);
//        } catch (NoSuchElementException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            System.err.println("여행지 저장/수정 중 서버 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    /** ✅ 4. 여행지 삭제 */
//    @DeleteMapping("/travel/{travelId}")
//    public ResponseEntity<Void> deleteTravel(@PathVariable Long travelId) {
//        try {
//            travelService.deleteTravel(travelId);
//            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
//        } catch (NoSuchElementException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            System.err.println("여행지 삭제 중 서버 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    /** ✅ 5. 상태 일괄 변경 API */
//    @PatchMapping("/travel/state")
//    public ResponseEntity<String> updateState(@RequestBody Map<String, Object> payload) {
//        try {
//            List<Integer> ids = (List<Integer>) payload.get("ids");
//            Integer state = (Integer) payload.get("state");
//
//            if (ids == null || ids.isEmpty()) {
//                return ResponseEntity.badRequest().body("변경할 항목이 없습니다.");
//            }
//
//            adminTravelService.updateState(ids, state);
//            return ResponseEntity.ok("상태 변경 완료");
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("상태 변경 중 오류: " + e.getMessage());
//        }
//    }
//
//    /** ✅ 6. 외부 API 데이터 저장 */
////    @PostMapping("/travel/load_save")
////    public ResponseEntity<String> loadAndSave() {
////        try {
////            int count = travelService.saveApiData();
////            return ResponseEntity.ok("API 데이터 저장 완료 총 " + count + " 건 처리됨.");
////        } catch (Exception e) {
////            e.printStackTrace();
////            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
////                    .body("API 데이터 저장 중 오류 발생: " + e.getMessage());
////        }
////    }
//}
