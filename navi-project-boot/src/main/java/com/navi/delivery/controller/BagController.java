package com.navi.delivery.controller;

import com.navi.delivery.domain.Bag;
import com.navi.delivery.service.BagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 가방 요금 관리 컨트롤러
 * - 요금 조회 / 추가 / 수정 / 삭제
 */
@RestController
@RequestMapping("/api/delivery/bag")
@RequiredArgsConstructor
public class BagController {

    private final BagService bagService;

    /*
     * 모든 가방 요금 조회
     */
    @GetMapping
    public ResponseEntity<List<Bag>> getAllBags() {
        return ResponseEntity.ok(bagService.getAllBags());
    }

    /*
     * 특정 가방 조회
     */
    @GetMapping("/{bagId}")
    public ResponseEntity<Bag> getBag(@PathVariable Long bagId) {
        return bagService.getBag(bagId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * 가방 요금 추가/수정
     */
    @PostMapping
    public ResponseEntity<Bag> saveBag(@RequestBody Bag bag) {
        return ResponseEntity.ok(bagService.saveBag(bag));
    }

    /*
     * 가방 요금 삭제
     */
    @DeleteMapping("/{bagId}")
    public ResponseEntity<Void> deleteBag(@PathVariable Long bagId) {
        bagService.deleteBag(bagId);
        return ResponseEntity.noContent().build();
    }
}
