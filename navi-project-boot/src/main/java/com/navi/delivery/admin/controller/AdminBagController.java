package com.navi.delivery.admin.controller;

import com.navi.delivery.admin.dto.AdminBagDTO;
import com.navi.delivery.admin.service.AdminBagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/deliveries/bags")
public class AdminBagController {

    private final AdminBagService adminBagService;

    /**
     * ✅ 전체 가방 조회
     */
    @GetMapping
    public List<AdminBagDTO> getAllBags() {
        log.info("[ADMIN] 전체 가방 목록 조회");
        return adminBagService.getAllBags();
    }

    /**
     * ✅ 단일 가방 조회
     */
    @GetMapping("/{id}")
    public AdminBagDTO getBagById(@PathVariable Long id) {
        log.info("[ADMIN] 단일 가방 조회: {}", id);
        return adminBagService.getBagById(id);
    }

    /**
     * ✅ 가방 등록
     */
    @PostMapping
    public AdminBagDTO createBag(@RequestBody AdminBagDTO dto) {
        log.info("[ADMIN] 가방 등록 요청: {}", dto.getBagName());
        return adminBagService.createBag(dto);
    }

    /**
     * ✅ 가방 수정
     */
    @PutMapping("/{id}")
    public AdminBagDTO updateBag(@PathVariable Long id, @RequestBody AdminBagDTO dto) {
        log.info("[ADMIN] 가방 수정 요청: id={}, name={}", id, dto.getBagName());
        return adminBagService.updateBag(id, dto);
    }

    /**
     * ✅ 가방 삭제
     */
    @DeleteMapping("/{id}")
    public void deleteBag(@PathVariable Long id) {
        log.info("[ADMIN] 가방 삭제 요청: id={}", id);
        adminBagService.deleteBag(id);
    }
}
