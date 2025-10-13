package com.navi.bag.controller;

import com.navi.bag.domain.Bag;
import com.navi.bag.service.BagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 가방 요금 관리 컨트롤러
 * - CRUD 기능 제공
 */
@RestController
@RequestMapping("/api/bag")
@RequiredArgsConstructor
public class BagController {

    private final BagService bagService;

    /**
     * 전체 가방 요금 조회
     */
    @GetMapping
    public ResponseEntity<List<Bag>> getAllBags() {
        return ResponseEntity.ok(bagService.getAllBags());
    }

    /**
     * 가방 크기로 단일 요금 조회
     */
    @GetMapping("/{size}")
    public ResponseEntity<Bag> getBag(@PathVariable String size) {
        return bagService.getBagBySize(size)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 가방 요금 등록 또는 수정
     */
    @PostMapping
    public ResponseEntity<Bag> createOrUpdateBag(@RequestBody Bag bag) {
        return ResponseEntity.ok(bagService.saveBag(bag));
    }

    /**
     * 가방 요금 삭제
     */
    @DeleteMapping("/{size}")
    public ResponseEntity<Void> deleteBag(@PathVariable String size) {
        bagService.deleteBag(size);
        return ResponseEntity.noContent().build();
    }
}
