package com.navi.travel.controller;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRequestDTO;
import com.navi.travel.dto.admin.AdminTravelDetailResponseDTO;
import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
import com.navi.travel.dto.admin.AdminTravelRequestDTO;
import com.navi.travel.service.AdminTravelService;
import com.navi.travel.service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class TravelAdminController {

    private final TravelService travelService;
    private final AdminTravelService adminTravelService;

    // --------------------------------------------------------------------
    // ✅ 관리자(Admin) API (CRUD + 상태변경)
    // --------------------------------------------------------------------

    /** ✅ 1. 여행지 관리 목록 조회 */
    @GetMapping("/travel")
    public ResponseEntity<Map<String, Object>> getAdminList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "travelId") String sortField,
            @RequestParam(defaultValue = "descend") String sortOrder
    ) {
        // ✅ 프론트에서 받은 정렬 방향 처리
        Sort sort = "descend".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AdminTravelListResponseDTO> travelPage =
                adminTravelService.getAdminTravelList(pageable, search);

        Map<String, Object> result = new HashMap<>();
        result.put("content", travelPage.getContent());
        result.put("totalPages", travelPage.getTotalPages());
        result.put("totalElements", travelPage.getTotalElements());
        result.put("number", travelPage.getNumber());
        result.put("size", travelPage.getSize());

        return ResponseEntity.ok(result);
    }

    /** ✅ 2. 여행지 상세 조회 (관리자용) */
    @GetMapping("/travel/detail/{travelId}")
    public ResponseEntity<AdminTravelDetailResponseDTO> getAdminTravelDetail(@PathVariable Long travelId) {
        try {
            AdminTravelDetailResponseDTO detail = adminTravelService.getAdminTravelDetail(travelId);
            return ResponseEntity.ok(detail);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("여행지 상세 조회 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /** ✅ 3. 여행지 등록 / 수정 (관리자용) */
    @PostMapping("/travel")
    @Secured("ROLE_ADMIN")
    public ResponseEntity<AdminTravelDetailResponseDTO> saveOrUpdateTravel(@RequestBody AdminTravelRequestDTO dto) {
        try {
            Travel saved = adminTravelService.saveOrUpdateTravel(dto); // ✅ 새 메서드 사용
            return ResponseEntity.ok(AdminTravelDetailResponseDTO.of(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    /** ✅ 4. 여행지 삭제 */
    @DeleteMapping("/travel/{travelId}")
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

    /** ✅ 5. 상태 일괄 변경 API */
    @PatchMapping("/travel/state")
    public ResponseEntity<String> updateState(@RequestBody Map<String, Object> payload) {
        try {
            Object idsObj = payload.get("ids");
            Object stateObj = payload.get("state");

            if (!(idsObj instanceof List<?> ids) || !(stateObj instanceof Number)) {
                return ResponseEntity.badRequest().body("요청 데이터 형식이 올바르지 않습니다.");
            }

            // ✅ Integer 변환 보장
            List<Long> idList = ids.stream()
                    .filter(Objects::nonNull)
                    .map(o -> Long.valueOf(o.toString()))
                    .toList();

            Integer state = ((Number) stateObj).intValue();

            if (idList.isEmpty()) {
                return ResponseEntity.badRequest().body("변경할 항목이 없습니다.");
            }

            adminTravelService.updateState(idList, state);
            return ResponseEntity.ok("상태 변경 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("상태 변경 중 오류: " + e.getMessage());
        }
    }

    /** ✅ 6. 외부 API 데이터 저장 */
    @PostMapping("/travel/load_save")
    public ResponseEntity<String> loadAndSave() {
        try {
            int count = travelService.saveApiData();
            return ResponseEntity.ok("API 데이터 저장 완료 총 " + count + " 건 처리됨.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("API 데이터 저장 중 오류 발생: " + e.getMessage());
        }
    }
}
